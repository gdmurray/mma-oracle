import bcrypt from "bcryptjs";
import {prisma} from "../services/prisma";
import {Request, Response} from "express";

export async function hashPassword(password: string) {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash password
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Hashing error:', error);
        throw error;
    }
}

export async function setPassword(req: Request, res: Response): Promise<void> {
    const {userId, password} = req.body;
    const hashed = await hashPassword(password);
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashed
        },
    })

    res.status(200).send("OK");
}
