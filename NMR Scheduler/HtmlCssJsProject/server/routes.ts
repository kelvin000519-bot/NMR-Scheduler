import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { z } from "zod";

// Validation schema for reservation creation
const createReservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
}).refine((data) => {
  // Validate time is in 10-minute increments
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  return startM % 10 === 0 && endM % 10 === 0;
}, { message: "Times must be in 10-minute increments" }).refine((data) => {
  // Validate duration is max 30 minutes
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const duration = endMinutes - startMinutes;
  return duration > 0 && duration <= 30;
}, { message: "Reservation must be between 10 and 30 minutes" });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Reservation routes
  app.get("/api/reservations", isAuthenticated, async (req: any, res) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      const reservations = await storage.getReservationsByDate(date);
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.post("/api/reservations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isApproved) {
        return res.status(403).json({ message: "User not approved for reservations" });
      }

      // Validate request body with zod schema
      const validationResult = createReservationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid reservation data", 
          errors: validationResult.error.flatten().fieldErrors 
        });
      }

      const { date, startTime, endTime } = validationResult.data;

      // Parse times for further validation
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Check for overlapping reservations
      const existingReservations = await storage.getReservationsByDate(date);
      const hasOverlap = existingReservations.some((res) => {
        const resStartMinutes = parseInt(res.startTime.split(":")[0]) * 60 + parseInt(res.startTime.split(":")[1]);
        const resEndMinutes = parseInt(res.endTime.split(":")[0]) * 60 + parseInt(res.endTime.split(":")[1]);
        return (startMinutes < resEndMinutes && endMinutes > resStartMinutes);
      });

      if (hasOverlap) {
        return res.status(400).json({ message: "Time slot already reserved" });
      }

      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || "Unknown";

      const reservation = await storage.createReservation({
        userId,
        date,
        startTime,
        endTime,
        userName,
      });

      res.json(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  app.delete("/api/reservations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const reservation = await storage.getReservation(req.params.id);

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      // Only owner or admin can delete
      if (reservation.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this reservation" });
      }

      await storage.deleteReservation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(500).json({ message: "Failed to delete reservation" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post("/api/admin/users/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const user = await storage.approveUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post("/api/admin/users/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.rejectUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get("/api/admin/reservations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reservations = await storage.getAllReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching all reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  return httpServer;
}
