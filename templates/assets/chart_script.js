var toggleListVisibility = function(element){
    document.getElementById('groupList').classList.toggle('invisible');
    document.getElementById('groupSelect').classList.toggle('active');
}

window.onload = function(){
    document.getElementById('groupSelect').addEventListener('click', toggleListVisibility);
}


