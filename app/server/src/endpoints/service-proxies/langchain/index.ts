import express from 'express';
import RequestHandler from "../../base";
import { config } from '../../../config';
import AutonomousServiceHandler from './autonomousHandler';
import {OpenAI} from 'langchain/llms'
import Logger from '../../../logger';

export const endpoint = 'https://api.openai.com/v1/chat/completions';
export const apiKey = config.services?.openai?.apiKey || process.env.OPENAI_API_KEY;

export default class AutonomousHandler extends RequestHandler {
    async handler(req: express.Request, res: express.Response) {
        const { action } = req.body;
        const openAILLM = new OpenAI({
            openAIApiKey: config.services?.openai?.apiKey,
            modelName: req.body.model,
        })
        const LLMActions = new AutonomousServiceHandler(openAILLM,"nothing")
        switch (action) {
            case 'START':
                const startGoal = await LLMActions.start_goal_agent({goal:req.body.goal})
                return res.json(startGoal)
            case 'ANALYZE':
                const analyzeGoal = await LLMActions.analyze_task_agent({goal:req.body.goal, task:req.body.task })
                return res.json(analyzeGoal)
            case 'EXECUTE':
                const executeGoal = await LLMActions.execute_task_agent({goal:req.body.goal, task:req.body.task, analysis:req.body.analysis })
                return res.json(executeGoal)
            case 'CREATE':
                const newTasks = await LLMActions.create_new_tasks_agent({
                    goal:req.body.goal,
                    tasks:req.body.tasks,
                    completedTasks: req.body.completedTasks,
                    lastTask: req.body.lastTask,
                    result: req.body.result,
                })
                return res.json(newTasks)
                // return res.send("Action is Create")
            case 'TOOLS':
                return res.send("Action is tools")
            default:
                return res.send("No action to be taken")
        }
    }

    public isProtected() {
        return config.services?.openai?.loginRequired ?? true;
    }
}