taskArray = []

document.getElementById("theForm").onsubmit = function (e) {
    e.preventDefault()
    let taskName = document.getElementById("searchTerm1").value
    let taskDate = document.getElementById("searchTerm2").value
    let newTask = new Task(taskName, taskDate)
    console.log(newTask)
    taskArray.push(newTask)
}

function Task(taskName, taskDate) {
    this.taskName = taskName;
    this.taskDate = taskDate; 
}

function storeTask(task) {
    let serialTask = JSON.stringify(task)
    localStorage.setItem(task.taskName, serialTask)
}

function retrieveTask(task) {
    let deserializedTask = JSON.parse(localStorage.getItem(task.taskName))
    return deserializedTask
}
