document.getElementById("enter").onclick =  function (e) {
    e.preventDefault();
    let taskInput = document.getElement('myInput').value;
    let newTask = new Task(taskInput)
    console.log(newTask)
    storeTask(newTask)
}

function Task(taskName){
    this.taskName = taskName;
    // this.taskDate = taskDate;
}


function storeTask(task){
    let serialTask = JSON.stringify(task)
    localStorage.setItem(task.taskName, serialTask)
}


function retrieveTask(task){
    let deserializedTask = JSON.parse(localStorage.getItem(task.taskName))
    return deserializedTask
}


function selectDay(){

}