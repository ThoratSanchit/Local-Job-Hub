import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        reply.code(403).send({ message: "No token provided!" });
        return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const secret = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production';

    jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            reply.code(401).send({ message: "Unauthorized!" });
            return;
        }
        
        // Attach decoded user info to request
        (req as any).user = decoded;
        done();
    });
};
