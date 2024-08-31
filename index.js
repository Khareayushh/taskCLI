#!/usr/bin/env node

import { Command } from "commander";
import fs, { read } from 'fs';
import path from "path";
import { fileURLToPath } from "url";

const program = new Command();

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const tasksFilePath = path.join(_dirname, 'tasks.json');

function readTasks(){
  const data = fs.readFileSync(tasksFilePath);
  return JSON.parse(data);
}

function writeTasks(tasks){
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), "utf-8");
}

// addition of task to tasks
program
  .command('add <description> [status]')
  .description("addition of task to database, description is required, status is optional and must choose from {'todo', 'in-progress', 'done'}.")
  .action((description, status='todo') => {
    const validStatuses = ['todo', 'in-progress', 'done'];
    
    if(!validStatuses.includes(status)){
      console.error(`Invalid status. Please use one of the following: ${validStatuses.join(', ')}`);
      return;
    }
    const tasks = readTasks();
    const newTask = {
      id: Date.now().toString(),
      description,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tasks.push(newTask);
    writeTasks(tasks);
    console.log("task added:", newTask);
  });
  
  // command to update a task;
  program
  .command('update <taskId> <status>')
  .description("updates the specifies task, id & status is required and status must be from {'todo', 'in-progress', 'done'}")
  .action((taskId, status)=>{
    const tasks = readTasks();
    const task = tasks.find((task)=>task.id === taskId);
    const validStatuses = ['todo', 'in-progress', 'done'];

    if(!validStatuses.includes(status)){
      console.error(`Invalid status. Please use one of the following: ${validStatuses.join(', ')}`);
      return;
    }

    if(task){
      task.status = status;
      task.updatedAt = new Date().toISOString();
      writeTasks(tasks);
      console.log('Task updated:', task);
    }
    else{
      console.log(`Task with id ${taskId} not found`);
    }
  });

// command to delete the task;
program
  .command('delete <taskId>')
  .description('deletes the task with specified Id, id is required.')
  .action((taskId)=>{
    let tasks = readTasks();
    tasks = tasks.filter((task)=> task.id !== taskId);
    writeTasks(tasks);
    console.log(`Task with id ${taskId} deleted.`);
  });

// command to list all the tasks
program
  .command('list [status]')
  .description('List all tasks')
  .action((status)=>{
    const tasks = readTasks();
    if(!status){
      console.log('Tasks:', tasks);
    }
    else{
      const validStatuses = ['todo', 'in-progress', 'done'];

      if(!validStatuses.includes(status)){
        console.error(`Invalid status. Please use one of the following: ${validStatuses.join(', ')}`);
        return;
      }
      const t = tasks.filter((task)=>task.status===status);
      console.log(`Tasks ${status}:`, t);
    }
  })

program
  .version("1.0.0")
  .description("My Node CLI")
  .option("-n, --name <type>", "Add your name")
  .action((options) => {
    console.log(`Hey, ${options.name}!`);
  });

program.parse(process.argv);