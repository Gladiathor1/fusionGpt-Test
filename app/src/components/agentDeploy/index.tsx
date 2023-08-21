import styled from '@emotion/styled';
import { ActionIcon, Avatar, Burger, Button, Loader, Menu, Popover, Textarea } from '@mantine/core';
import { getHotkeyHandler, useElementSize, useHotkeys } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppContext } from '../../core/context';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectSidebarTaskOpen, toggleSidebarTask } from '../../store/sidebarTasks';
import { whsiperAutioTranscription } from '../../core/chat/openai';
import useWhisper from '@chengsokdara/use-whisper';
import { useNavigate } from 'react-router-dom';
import { selectInputGoal, setInputGoal } from '../../store/agent';
import { speechRecognition, supportsSpeechRecognition } from '../../core/speech-recognition-types';
import { useOption } from '../../core/options/use-option';
import Tasks from './goal-tasks';
import DeployAgent from '../../core/chat/deploy-agent';
import { selectTasks, addNewTasks, updateTask, resetTasks } from '../../store/tasks';
import sendLog from '../../core/utils/sendLogs';


const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: rgba(45, 45, 45, 1) !important;

    font-family: "Work Sans", sans-serif;
    box-shadow: 0px 0px 1rem 0.2rem rgb(0 0 0 / 5%);
    position: absolute;
    right: 0;
    z-index: 50;

    .sidebar-header {
        padding: 0.5rem 1rem 0.5rem 1.618rem;
        min-height: 2.618rem;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h2 {
            font-size: 1rem;
            font-weight: bold;
        }
    }

    .sidebar-content {
        flex-grow: 1;
        overflow-y: scroll;

        /* hide scrollbars */
        &::-webkit-scrollbar {
            display: none;
        }
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */

        min-width: 20vw;

        padding-bottom: 2rem;
    }

    .sidebar-footer {
        border-top: thin solid rgba(255, 255, 255, 0.1);
        padding: 0.5rem 1.118rem;
        padding-left: 0.5rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        font-size: 1rem;
        cursor: pointer;

        .user-info {
            max-width: calc(100% - 1.618rem * 2 - 2.5rem);
            margin-right: 0.5rem;
        }

        strong, span {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        strong {
            font-weight: bold;
            margin-bottom: 0.2rem;
        }

        span {
            font-size: 0.8rem;
            font-weight: 100;
        }

        .mantine-Avatar-root {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            overflow: hidden;
            width: 2.5rem;
            height: 2.5rem;
            min-width: 0;
            flex-grow: 0;
            flex-shrink: 0;
            margin: 0.5rem;
        }
    }

    .spacer {
        flex-grow: 1;
    }
`;

export default function SidebarTasks(props: {
    className?: string;
}) {
    const goal = useAppSelector(selectInputGoal)
    const tasks = useAppSelector(selectTasks)
    // const [goal,setInputGoal] = useState("")
    const intl = useIntl();
    const context = useAppContext();
    const dispatch = useAppDispatch();
    const sidebarOpen = useAppSelector(selectSidebarTaskOpen);
    const onBurgerClick = useCallback(() => dispatch(toggleSidebarTask()), [dispatch]);
    const [useOpenAIWhisper] = useOption<boolean>('speech-recognition', 'use-whisper');
    const { ref, width } = useElementSize();
    const [recording, setRecording] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [initialMessage, setInitialMessage] = useState('');
    const [submitOnEnter] = useOption<boolean>('input', 'submit-on-enter');
    const [showMicrophoneButton] = useOption<boolean>('speech-recognition', 'show-microphone');
    // const [tempTasks,setTempTasks]:any = useState([])




    const navigate = useNavigate();
    const {
        transcribing,
        transcript,
        startRecording,
        stopRecording
    } = useWhisper({
        apiKey: ' ',
        streaming: false,
        onTranscribe: async (transcript: Blob) => {
            const text: any = await whsiperAutioTranscription(transcript);
            return {text: text?.text}
        }
    });

    const [version, setVersion] = useState(0);
    const update = useCallback(() => {
        setVersion(v => v + 1);
    }, []);

    const onSubmit = useCallback(async () => {
        sendLog('Agent Submit Button Clicked', 'INFO');

        sendLog('setting Speech Error as Null', 'INFO');
        setSpeechError(null);
        sendLog('after setting Speech Error as Null', 'INFO');


        sendLog('Creating Goal Instance variable', 'INFO');
        const GoalInstance = new DeployAgent("gpt-3.5-turbo", goal, context.onNewMessage)
        sendLog('after Creating Goal Instance', 'INFO');

        sendLog('Creating Start Goal variable', 'INFO');
        const StartGoal: any = await GoalInstance.start_goal_agent({goal})


        if (GoalInstance.chat_id) {
            if (!window.location.pathname.includes(StartGoal.chat_id)) {
                sendLog(`navigating to /chat/${StartGoal.chat_id}`, 'INFO');
                navigate('/chat/' + StartGoal.chat_id);
            }
            sendLog(`calling dispatch and passing setInputGoal('')`, 'INFO');
            dispatch(setInputGoal(''));
            // setInputGoal('')
        }

        if(StartGoal && StartGoal?.tasks){ 
            sendLog(`calling dispatch and passing addNewTasks(StartGoal.tasks)`, 'INFO');
            sendLog(`StartGoal => ${JSON.stringify(StartGoal)}`, 'INFO');
            // setTempTasks(StartGoal.tasks)
            // console.log(tempTasks,StartGoal.tasks)
            dispatch(addNewTasks(StartGoal.tasks))
            // console.log(tempTasks,StartGoal.tasks)
        }
        // console.log(tempTasks,StartGoal.tasks)

        let allTasks: {
            id: string;
            task: string;
            in_progress: boolean;
            in_done: boolean;
            result: any;
        }[] | any = structuredClone(StartGoal.tasks)
        // console.log(test)
        // console.log("===================================== Thsi is ithe huge test value",test)
        if(allTasks.length > 0){
            sendLog(`inside if(StartGoal.tasks.length > 0)`, 'INFO');
            sendLog(`starting for loop for StartGoal.tasks.length`, 'INFO');
            for(let i = 0; i < allTasks.length; i++){
                // console.log("=======================================Value of test right now",test)
                sendLog(`iteration ${i}`, 'INFO');
                sendLog(`creating variable task and assigining it StartGoal.tasks[i]`, 'INFO');
                const task:any = allTasks[i]
                sendLog(`current task is ${JSON.stringify(task)}`, 'INFO');
                sendLog(`updateTaskStatus() function called`, 'INFO');
                sendLog(`updating task ${task.id} in_progress to true`, 'INFO')


                updateTaskStatus(task.id, {in_progress: true})



                // console.log("=======================================Doing this task Right now and appearing Error",task)
                task.in_progress = true
                sendLog(`creating variable actionToPerform and assigining it GoalInstance.analyze_goal({task:task.task}`, 'INFO');
                const actionToPerform: any = await GoalInstance.analyze_goal({task:task.task})
                sendLog(`actionToPerform value is ${JSON.stringify(actionToPerform)}`, 'INFO');


                // console.log(actionToPerform)
                if(actionToPerform && actionToPerform?.arg === ""){
                    sendLog(`inside if(actionToPerform && actionToPerform?.arg === "")`, 'INFO');
                    // GoalInstance.start_to_lookup(actionToPerform)
                    sendLog(`calling updateTaskStatus`, 'INFO');
                    sendLog(`updating task ${task.id} in_done to true`, 'INFO')
                    updateTaskStatus(task.id, {in_done: true})
                    // updateTempTasks(task.id, {in_done: true})
                    task.in_done = true
                    continue;
                }
                sendLog(`calling GoalInstance.start_to_lookup(actionToPerform)`, 'INFO');
                GoalInstance.start_to_lookup(actionToPerform)

                sendLog(`calling GoalInstance.execute_goal(task.task, actionToPerform)`, 'INFO');
                const taskResult = await GoalInstance.execute_goal(task.task, actionToPerform)

                sendLog(`calling updateTaskStatus(task.id, {in_done: true})`, 'INFO');
                updateTaskStatus(task.id, 
                    {
                        in_done: true,
                        result: taskResult
                    }
                )
                // updateTempTasks(task.id,{
                //     in_done: true,
                //     result: taskResult
                // })
                task.in_done = true
                task.result = taskResult
                let newTasks = await GoalInstance.create_new_task(allTasks, task)
                sendLog(`newTasks values => ${JSON.stringify(newTasks)}`, 'INFO');
                if(newTasks.length > 0){
                    sendLog(`inside if(newTasks.length > 0)`, 'INFO');
                    sendLog(`calling dispatch and passing addNewTasks(newTasks)`, 'INFO');
                    dispatch(addNewTasks(newTasks))
                    const newTasksArray = structuredClone(newTasks)
                    // const test = [...tempTasks, ...newTasks]
                    // setTempTasks(test)
                    newTasksArray.forEach((task:any) => {
                        allTasks.push(task)
                    })
                }

                sendLog(`allTasks value at the end of iteration ${i} => ${JSON.stringify(allTasks)}`, 'INFO');
                

            }
        }
    }, [context, goal, dispatch, navigate]);


    function updateTaskStatus(id:string, values:any){
        sendLog('updateTaskStatus function start', 'INFO');
        
        const data: any = {
            id,
            value: values
        }

        sendLog(`data being sent to dispatch(updateTask(data)) => ${JSON.stringify(data)}`, 'INFO');

        dispatch(updateTask(data))
    }

    const onSpeechError = useCallback((e: any) => {
        console.error('speech recognition error', e);
        sendLog(`speech recognition error ${e}`, 'INFO');
        setSpeechError(e.message);

        try {
            speechRecognition?.stop();
        } catch (e) {
        }

        try {
            stopRecording();
        } catch (e) { }

        setRecording(false);
    }, [stopRecording]);




    const onHideSpeechError = useCallback(() => setSpeechError(null), []);

    const onSpeechStart = useCallback(async () => {
        let granted = false;
        let denied = false;

        try {
            const result = await navigator.permissions.query({ name: 'microphone' as any });
            if (result.state == 'granted') {
                granted = true;
            } else if (result.state == 'denied') {
                denied = true;
            }
        } catch (e) { }

        if (!granted && !denied) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                stream.getTracks().forEach(track => track.stop());
                granted = true;
            } catch (e) {
                denied = true;
            }
        }

        if (denied) {
            onSpeechError(new Error('speech permission was not granted'));
            return;
        }

        try {
            if (!recording) {
                setRecording(true);

                if (useOpenAIWhisper || !supportsSpeechRecognition) {
                    // if (!openAIApiKey) {
                    //     dispatch(openOpenAIApiKeyPanel());
                    //     return false;
                    // }
                    // recorder.start().catch(onSpeechError);
                    setInitialMessage(goal);
                    await startRecording();
    

                } else if (speechRecognition) {
                    const initialMessage = goal;

                    speechRecognition.continuous = true;
                    speechRecognition.interimResults = true;

                    speechRecognition.onresult = (event) => {
                        let transcript = '';
                        for (let i = 0; i < event.results.length; i++) {
                            if (event.results[i].isFinal && event.results[i][0].confidence) {
                                transcript += event.results[i][0].transcript;
                            }
                        }
                        dispatch(setInputGoal(initialMessage + ' ' + transcript));
                        // setInputGoal(initialMessage + ' ' + transcript)
                    };

                    speechRecognition.start();
                } else {
                    onSpeechError(new Error('not supported'));
                }
            } else {
                if (useOpenAIWhisper || !supportsSpeechRecognition) {
                    await stopRecording();
                    setTimeout(() => setRecording(false), 500);
                } else if (speechRecognition) {
                    speechRecognition.stop();
                    setRecording(false);
                } else {
                    onSpeechError(new Error('not supported'));
                }
            }
        } catch (e) {
            onSpeechError(e);
        }
    }, [recording, goal, dispatch, onSpeechError, setInitialMessage]);

    const onChange = (e: any) => {
        dispatch(setInputGoal(e.target.value));
        // setInputGoal(e.target.value)
    };
    
    useEffect(() => {
        if (useOpenAIWhisper || !supportsSpeechRecognition) {
            if (!transcribing && !recording && transcript?.text) {
                dispatch(setInputGoal(initialMessage + ' ' + transcript.text));
                // setInputGoal(initialMessage + ' ' + transcript.text)
            }
        }
        context.chat.on("update",update)
        return () => {
            context.chat.off('update', update);
        };
    }, [initialMessage, transcript, recording, transcribing, useOpenAIWhisper, dispatch]);

    
    useHotkeys([
        ['n', () => document.querySelector<HTMLTextAreaElement>('#goal-input')?.focus()]
    ]);
    const blur = useCallback(() => {
        document.querySelector<HTMLTextAreaElement>('#goal-input')?.blur();
    }, []);

    const burgerLabel = sidebarOpen
        ? intl.formatMessage({ defaultMessage: "Close sidebar" })
        : intl.formatMessage({ defaultMessage: "Open sidebar" });

        const rightSection = useMemo(() => {
            return (
                <div style={{
                    opacity: '0.8',
                    paddingRight: '0.5rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%',
                }}>
                    {context.generating && (<>
                        <Button variant="subtle" size="xs" compact onClick={() => {
                            context.chat.cancelReply(context.currentChat.chat?.id, context.currentChat.leaf!.id);
                        }}>
                            <FormattedMessage defaultMessage={"Cancel"} description="Label for the button that can be clicked while the AI is generating a response to cancel generation" />
                        </Button>
                        <Loader size="xs" style={{ padding: '0 0.8rem 0 0.5rem' }} />
                    </>)}
                    {!context.generating && (
                        <>
                            {showMicrophoneButton && <Popover width={200} position="bottom" withArrow shadow="md" opened={speechError !== null}>
                                <Popover.Target>
                                    <ActionIcon size="xl"
                                        onClick={onSpeechStart}
                                        // disabled={tasks.length > 0}
                                        >
                                        {transcribing && <Loader size="xs" />}
                                        {!transcribing && <i className="fa fa-microphone" style={{ fontSize: '90%', color: recording ? 'red' : 'inherit' }} />}
                                    </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                    }}>
                                        <p style={{
                                            fontFamily: `"Work Sans", sans-serif`,
                                            fontSize: '0.9rem',
                                            textAlign: 'center',
                                            marginBottom: '0.5rem',
                                        }}>
                                            Sorry, an error occured trying to record audio.
                                        </p>
                                        <Button variant="light" size="xs" fullWidth onClick={onHideSpeechError}>
                                            Close
                                        </Button>
                                    </div>
                                </Popover.Dropdown>
                            </Popover>}
                            <ActionIcon size="xl"
                                // disabled={tasks.length > 0}
                                onClick={onSubmit}>
                                <i className="fa fa-paper-plane" style={{ fontSize: '90%' }} />
                            </ActionIcon>
                        </>
                    )}
                </div>
            );
        }, [recording, transcribing, onSubmit, onSpeechStart, context.generating, speechError, onHideSpeechError, showMicrophoneButton]);

        const hotkeyHandler = useMemo(() => {
            const keys = [
                ['Escape', blur, { preventDefault: true }],
                ['ctrl+Enter', onSubmit, { preventDefault: true }],
    
            ];
            if (submitOnEnter) {
                keys.unshift(['Enter', onSubmit, { preventDefault: true }]);
            }
            const handler = getHotkeyHandler(keys as any);
            return handler;
        }, [onSubmit, blur, submitOnEnter]);


    const elem = useMemo(() => (
        <Container className={"sidebarTasks " + (sidebarOpen ? 'opened' : 'closed')} ref={ref}>
            <div className="sidebar-header">
                <h2><FormattedMessage defaultMessage={"Current Tasks"} description="Heading for the chat history screen" /></h2>
                <Burger opened={true} onClick={onBurgerClick} aria-label={burgerLabel} transitionDuration={0} />
            </div>
            <div className="sidebar-content">
                <Tasks tasks={tasks} />
            </div>
            <div className="sidebar-footer">
                    <Textarea
                        id="goal-input"
                        style={{
                            backgroundColor: "rgb(70,70,70) !important",
                            width: "100%"
                        }}
                        // disabled={tasks.length > 0}
                        autosize
                        minRows={1}
                        maxRows={12}
                        placeholder={intl.formatMessage({ defaultMessage: "Enter a goal here..." })}
                        value={goal}
                        onChange={onChange}
                        rightSection={rightSection}
                        rightSectionWidth={context.generating ? 100 : 55}
                        onKeyDown={hotkeyHandler} 
                        />
            </div>
        </Container>
    ), [sidebarOpen, goal, tasks, width, ref, burgerLabel, onBurgerClick, dispatch, version]);

    return elem;
}