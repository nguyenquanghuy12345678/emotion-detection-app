/**
 * Vercel Serverless Function for Co-working Rooms
 * Handles room management, sync, and real-time updates
 */

// In-memory storage (for demo - use Redis/MongoDB for production)
const rooms = new Map();

// Cleanup old rooms every hour
setInterval(() => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    for (const [roomId, room] of rooms.entries()) {
        if (now - room.created > ONE_DAY) {
            rooms.delete(roomId);
        }
    }
}, 60 * 60 * 1000);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { method, query, body } = req;
    
    try {
        switch (method) {
            case 'GET':
                return handleGet(req, res, query);
            
            case 'POST':
                return handlePost(req, res, body);
            
            case 'PUT':
                return handlePut(req, res, query, body);
            
            case 'DELETE':
                return handleDelete(req, res, query);
            
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// GET: List all rooms or get specific room
function handleGet(req, res, query) {
    const { roomId } = query;
    
    if (roomId) {
        // Get specific room
        const room = rooms.get(roomId);
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        return res.status(200).json({ 
            success: true,
            room: room 
        });
    } else {
        // List all rooms
        const allRooms = Array.from(rooms.values()).map(room => ({
            id: room.id,
            name: room.name,
            memberCount: room.members.length,
            created: room.created
        }));
        
        return res.status(200).json({ 
            success: true,
            rooms: allRooms 
        });
    }
}

// POST: Create new room
function handlePost(req, res, body) {
    const { name, creator } = body;
    
    if (!name) {
        return res.status(400).json({ error: 'Room name required' });
    }
    
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const room = {
        id: roomId,
        name: name,
        created: Date.now(),
        members: creator ? [creator] : [],
        pomodoro: {
            time: 1500,
            isRunning: false,
            session: 'work',
            startedBy: null,
            startedAt: null
        },
        chat: [],
        goals: [],
        stats: {
            totalPomodoros: 0,
            totalWorkTime: 0
        }
    };
    
    rooms.set(roomId, room);
    
    return res.status(201).json({ 
        success: true,
        room: room 
    });
}

// PUT: Update room (join, leave, sync)
function handlePut(req, res, query, body) {
    const { roomId } = query;
    const { action, data } = body;
    
    const room = rooms.get(roomId);
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    switch (action) {
        case 'join':
            // Add member
            const existingMember = room.members.find(m => m.id === data.id);
            if (!existingMember) {
                room.members.push(data);
            } else {
                // Update member info
                Object.assign(existingMember, data);
            }
            break;
        
        case 'leave':
            // Remove member
            room.members = room.members.filter(m => m.id !== data.userId);
            break;
        
        case 'pomodoro':
            // Update pomodoro state
            Object.assign(room.pomodoro, data);
            if (data.complete) {
                room.stats.totalPomodoros++;
            }
            break;
        
        case 'chat':
            // Add chat message
            room.chat.push(data);
            // Keep last 100 messages
            if (room.chat.length > 100) {
                room.chat = room.chat.slice(-100);
            }
            break;
        
        case 'goal':
            // Add or update goal
            const goalIndex = room.goals.findIndex(g => g.id === data.id);
            if (goalIndex >= 0) {
                room.goals[goalIndex] = data;
            } else {
                room.goals.push(data);
            }
            break;
        
        case 'sync':
            // Full room sync
            if (data.members) room.members = data.members;
            if (data.pomodoro) room.pomodoro = data.pomodoro;
            if (data.stats) room.stats = data.stats;
            break;
        
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
    
    room.lastUpdate = Date.now();
    rooms.set(roomId, room);
    
    return res.status(200).json({ 
        success: true,
        room: room 
    });
}

// DELETE: Delete room
function handleDelete(req, res, query) {
    const { roomId } = query;
    
    if (!rooms.has(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    rooms.delete(roomId);
    
    return res.status(200).json({ 
        success: true,
        message: 'Room deleted' 
    });
}
