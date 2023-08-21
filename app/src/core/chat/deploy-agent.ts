import { uuidv4 } from "lib0/random";
import { ChatManager } from "..";
import sendLog from '../utils/sendLogs';
import AgentCore from "../utils/agent-core";

export default class DeployAgent{
    // private mutatedMessages: OpenAIMessage[];
    private mutatedParameters: any;
    model_settings:string;
    goal:string;
    chat_id: string;
    backend: AgentCore;
    currentMessageId: string;
    prevMessageId: string | undefined;
    onNewMessage: any;
    constructor(model_settings:string, goal:string, onNewMessage: any){
        this.initialize();
        this.chat_id = uuidv4()
        this.model_settings = model_settings;
        this.goal = goal;
        // this.backend = new Backend(this.chatmanager)
        this.backend = new AgentCore()
        this.currentMessageId = uuidv4();
        this.prevMessageId = undefined;
        this.onNewMessage = onNewMessage
    }

    async initialize() {
        sendLog('Deploy Agent constructor called', 'INFO');
    }

    async start_goal_agent({ goal }: { goal: string }) {
        sendLog('start_goal_agent function start', 'INFO');
        if(goal === "") {
            sendLog('goal was an empty string inside start_goal_agent()', 'INFO');
            return [];}

        sendLog('answer_question function called inside start_goal_agent()', 'INFO');
        this.answer_question({parentId: this.prevMessageId || this.currentMessageId, answer: `Lets start looking into the goal: ${goal}`})

        sendLog('tasksToDo variable created and assigned backend.startGoal inside start_goal_agent()', 'INFO');
        const tasksToDo = await this.backend.startGoal(goal, this.model_settings || "gpt-3.5-turbo")


        sendLog('answer_question function called inside start_goal_agent()', 'INFO');
        this.answer_question({parentId: this.prevMessageId || this.currentMessageId, answer: tasksToDo.join("\n"), isReply: true})

        sendLog('creating tasks from tasksToDo array inside start_goal_agent()', 'INFO');
        const tasks = tasksToDo.map(task=>{
            return {
                id: uuidv4(),
                task: task,
                in_done: false,
                in_progress: false,
            }
        })
        
        
        return {
            tasks:tasks,
            chat_id: this.chat_id
        };       

    }

    async start_to_lookup(actionToPerform:any | []){
        sendLog('start_to_lookup function start', 'INFO');
        const message:string = actionToPerform.arg !== "" ? `I'll ${actionToPerform?.action} with data: ${actionToPerform?.arg}` : "I'll not be able to perform without data, Skipping The Task..."

        sendLog('answer_question function called inside start_to_lookup()', 'INFO');
        this.answer_question({parentId: this.prevMessageId || this.currentMessageId, answer:message , isReply: true})
    }

    async analyze_goal({task}:{task:string}){

        sendLog('analyze_goal function start', 'INFO');

        sendLog('answer_question function called inside analyze_goal()', 'INFO');
        this.answer_question({parentId: this.prevMessageId || this.currentMessageId, answer: `Analyzing Task ${task}`})
        
        sendLog('actionToPerform variable created and assigned backend.analyzeGoal() inside analyze_goal()', 'INFO');
        const actionToPerform: any = await this.backend.analyzeGoal(this.goal, task, this.model_settings || "gpt-3.5-turbo")


        return actionToPerform
    }


    async execute_goal( task: string, analysis: { action: string, arg: string, reasoning: string }) {

        sendLog('execute_goal function start', 'INFO');
        
        sendLog('finalAnswer variable created and assigned backend.executeGoal() inside execute_goal()', 'INFO');
        const finalAnswer: any = await this.backend.executeGoal(this.goal, task, analysis, this.model_settings || "gpt-3.5-turbo")

        if(finalAnswer?.text){
            sendLog('inside if finalAnswer?.text and called answer_question() inside execute_goal()', 'INFO');
            this.answer_question({parentId:this.prevMessageId || this.currentMessageId,answer:finalAnswer.text, isReply: true})
        }else{
            sendLog('inside else statement of (if finalAnswer?.text) and called answer_question() inside execute_goal()', 'INFO');
            this.answer_question({parentId:this.prevMessageId || this.currentMessageId,answer:finalAnswer, isReply: true})
        }

        return finalAnswer?.text || ""
    }


    async create_new_task(tasks: {task:string,in_progress:boolean,in_done:boolean,id:string}[], last_completed_task:any){
        console.log(tasks)
        const uncompleted_tasks: any = tasks.filter((task:any)=>!task.in_done).map((task:any)=>task.task)
        const completed_tasks = tasks.filter((task:any)=>task.in_done).map((task:any)=>task.task)
        const last_task = last_completed_task

        
        const tasksToDo = await this.backend.createNewTask(this.goal, uncompleted_tasks, completed_tasks, last_task.task, last_task.result, this.model_settings || "gpt-3.5-turbo")
        return tasksToDo.map(task=>{
            return {
                id: uuidv4(),
                task: task,
                in_done: false,
                in_progress: false,
            }
        })
    }

    async answer_question({parentId, answer, isReply}:{parentId:string, answer:string, isReply?: boolean}){
        sendLog('answer_question function start', 'INFO');
        // const message: any = {
        //     chatID: this.chat_id,
        //     content: answer,
        //     requestedParameters: {
        //         model: this.model_settings || "gpt-3.5-turbo"
        //     },
        //     parentID: !this.prevMessageId ?  undefined : parentId,
        //     // parentID: undefined,
        //     isReply: isReply || false
        // }
        
        // this.chatmanager.sendMessage(message, "agent", this.currentMessageId)

        sendLog('id variable created and assigned onNewMessage() inside answer_question()', 'INFO');
        const id = await this.onNewMessage(answer, {
            messageType: "agent",
            isReply,
            parentId: !this.prevMessageId ? undefined : parentId,
            messageId: this.currentMessageId
        })
        
        sendLog('setting this.chat_id = id inside answer_question()', 'INFO');
        sendLog(`this.chat_id value is ${this.chat_id}`, 'INFO');
        sendLog(`id value is ${id}`, 'INFO');
        this.chat_id = id

        sendLog(`update_prev_id function called and passed value of this.currentMessageId which is ${this.currentMessageId} inside answer_question()`, 'INFO');
        this.update_prev_id(this.currentMessageId)

        sendLog(`update_current_id function called and passed value of uuidv4() which is ${uuidv4()} inside answer_question()`, 'INFO');
        this.update_current_id(uuidv4())
    }


    update_current_id(newId: string){
        sendLog('update_current_id function start', 'INFO');
        this.currentMessageId = newId
    }

    update_prev_id(newId: string){
        sendLog('update_prev_id function start', 'INFO');
        this.prevMessageId = newId
    }
}