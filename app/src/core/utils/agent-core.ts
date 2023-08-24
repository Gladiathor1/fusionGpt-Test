// const endpoint = '/chatapi';
const endpoint = 'http://207.148.24.227:3000/chatapi';

export default class AgentCore{
    async startGoal(goal: string, model: string) {
        return this.post(endpoint + '/proxies/autonomous', { goal, model, action: 'START' });
    }

    async analyzeGoal(goal: string, task: string, model: string) {

        try{
            return this.post(endpoint + '/proxies/autonomous', { goal, task, model, action: 'ANALYZE' });
        }catch(e){
            return {
                text: `Sorry, I'm unable to analyze this task: ${e}`
            }
        }
    }

    async executeGoal(goal: string, task: string, analysis: { action: string, arg: string, reasoning: string }, model: string) {
        try{
            return this.post(endpoint + '/proxies/autonomous', { goal, task, analysis, model, action: 'EXECUTE' });
        }catch(e){
            return {
                text: `Sorry, I'm unable to execute this task with the following details agent provided: ${e}`
            }
        }
    }
    
    async createNewTask(goal: string, tasks: [], completed_tasks:string[], last_task:string, result:string  , model: string) {

        try{
            return this.post(endpoint + '/proxies/autonomous', { goal, tasks, completed_tasks, last_task, result, model, action: 'CREATE' });
        }catch(e){
            return {
                text: `Sorry, I'm unable to execute this task with the following details agent provided: ${e}`
            }
        }
    }

    async get(url: string) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }

    async post(url: string, data: any) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        try{
            return response.json();
        }catch(e){
            return response.text() 
        }
    }

}