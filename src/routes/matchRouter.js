import { Router } from "express";
import { getMatchStatus } from "../utils/match-status.js";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { desc } from "drizzle-orm";

const matchRouter = Router();

matchRouter.get('/',async (req,res)=>{
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    const MAX_LIMIT = 100;

    if(!parsed.success){
        return res.status(400).json({error: 'Invalid query', details: parsed.error.issues});
    }

    const limits = Math.min(parsed.data.limit ?? 50 , MAX_LIMIT);
    try{
        const data = await db
        .select()
        .from(matches)
        .orderBy((desc(matches.createdAt)))
        .limit(limits)
        res.json({data: data});
    }catch(e){
        res.status(500).json({message: "Invalid request"})
    }
    res.status(200).json({message: "Matches List"});
});

matchRouter.post('/',async (req,res)=> {
    const parsed = createMatchSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({error: 'Invalid input', details: parsed.error.issues});
    }
    try{
        const [event] = await db.insert(matches).values({
            sport: parsed.data.sport,
            homeTeam: parsed.data.homeTeam,
            awayTeam: parsed.data.awayTeam,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: parsed.data.homeScore ?? 0,
            awayScore: parsed.data.awayScore ?? 0,
            status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
        }).returning();

        res.status(200).json({data: event});
    }catch(e){
        res.status(500).json({error: 'failed to create match.', details: JSON.stringify(e)});

    }
})
export default matchRouter;