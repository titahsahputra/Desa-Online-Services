import { Server } from 'socket.io';

interface ApplicationStatusUpdate {
  applicationId: string;
  trackingNumber: string;
  status: string;
  userId: string;
  message: string;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join admin room for admin notifications
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    // Handle application status updates
    socket.on('application-status-update', (data: ApplicationStatusUpdate) => {
      // Notify specific user
      io.to(`user-${data.userId}`).emit('application-updated', {
        type: 'application_updated',
        data: {
          applicationId: data.applicationId,
          trackingNumber: data.trackingNumber,
          status: data.status,
          message: data.message,
          timestamp: new Date().toISOString()
        }
      });

      // Notify admins about the update
      io.to('admin-room').emit('admin-application-updated', {
        type: 'admin_application_updated',
        data: {
          applicationId: data.applicationId,
          trackingNumber: data.trackingNumber,
          status: data.status,
          userId: data.userId,
          message: data.message,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Handle new application notifications
    socket.on('new-application', (data: { applicationId: string; trackingNumber: string; userId: string; serviceName: string }) => {
      // Notify admins about new application
      io.to('admin-room').emit('new-application-received', {
        type: 'new_application',
        data: {
          applicationId: data.applicationId,
          trackingNumber: data.trackingNumber,
          userId: data.userId,
          serviceName: data.serviceName,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Handle document generation notifications
    socket.on('document-generated', (data: { applicationId: string; trackingNumber: string; userId: string; documentName: string }) => {
      // Notify user about document generation
      io.to(`user-${data.userId}`).emit('document-ready', {
        type: 'document_ready',
        data: {
          applicationId: data.applicationId,
          trackingNumber: data.trackingNumber,
          documentName: data.documentName,
          message: 'Dokumen Anda sudah siap dan dapat diunduh',
          timestamp: new Date().toISOString()
        }
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

// Helper functions to emit notifications
export const notifyApplicationStatusUpdate = (io: Server, data: ApplicationStatusUpdate) => {
  io.emit('application-status-update', data);
};

export const notifyNewApplication = (io: Server, data: { applicationId: string; trackingNumber: string; userId: string; serviceName: string }) => {
  io.emit('new-application', data);
};

export const notifyDocumentGenerated = (io: Server, data: { applicationId: string; trackingNumber: string; userId: string; documentName: string }) => {
  io.emit('document-generated', data);
};