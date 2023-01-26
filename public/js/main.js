formRequestBody = (bodyElements) => {
    let formBody = [];
    for (let property in bodyElements) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(bodyElements[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return formBody;
};

sendPostRequest = async (URI, bodyElements) => {
    return new Promise((resolve, reject) => {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = (event) => {
            if (event.target.readyState !== 4) return;

            resolve(event.target.response);
        };
        httpRequest.onerror = (event) => {
            reject({
                status: event.target.status,
                statusText: httpRequest.statusText,
            })
        }

        let formBody = formRequestBody(bodyElements);

        httpRequest.open('POST', URI, true)
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        httpRequest.send(formBody)
    });
};

sendGetRequest = async (URI, bodyElements) => {
    return new Promise((resolve, reject) => {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = (event) => {
            if (event.target.readyState !== 4) return;

            resolve(event.target.response);
        };

        httpRequest.onerror = (event) => {
            reject({
                status: event.target.status,
                statusText: httpRequest.statusText,
            })
        };

        let formBody = formRequestBody(bodyElements);

        httpRequest.open("GET", URI, true);
        httpRequest.send(formBody);
    });
};

const tasks = document.querySelector("#tasks");
if (tasks !== null) {
    let tasksArray = null;

    const create__task = document.querySelector('#create__task');
    if (create__task !== null) {
        create__task.addEventListener('submit', (event) => {
            event.preventDefault();

            let elements = event.target.elements;
            let button = event.target.querySelector('button')

            button.setAttribute('disabled', '')
            button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "            <span class=\"sr-only\">Создание задачи...</span>";


            sendPostRequest("/tasks/create", {
                text: elements.text.value,
                is_important: elements.is_important.checked ? 1 : 0,
                date: elements.date.value
            })
                .then((result) => {
                    button.removeAttribute('disabled');
                    button.innerHTML = "";
                    button.innerText = "Создать задачу";
                    result = JSON.parse(result);
                    if (result.error != null) {
                        result.error.forEach((error) => {
                            alert(error)
                        })
                    } else {
                        create__task.reset();
                        tasksArray.push(result)
                        displayTasks(tasksArray)
                    }
                })
        })
    }

    getAndDisplayTasks = () => {
        sendGetRequest("/tasks/getTasks/", "")
        .then((result) => {
            tasksArray = JSON.parse(result);
            displayTasks(tasksArray)
        })
    };

    let currentPage;

    displayTasks = (tasksArray) => {
        tasks.innerHTML = "";

        if (tasksArray.length === 0) {
            tasks.innerHTML = "<h3>Задач пока что нет, создайте их :)</h3>"
        }

        tasksArray.sort((a, b) => {
            return (a.date > b.date)
        });

        tasksArray.forEach((task) => {
            let card = document.createElement('div');
            card.className = "card" + (task.is_completed == 1 ? ' text-bg-success' : '') + ((task.is_important == 1 && task.is_completed == 0) ? ' text-bg-warning' : '') + " mt-3";

            let cardBody = document.createElement('div');
            cardBody.className = "card-body";

            let cardTitle = document.createElement('h5');
            cardTitle.className = "card-title";
            cardTitle.textContent = "Задача #" + task.id;

            let cardText = document.createElement('p');
            cardText.className = "card-text";
            cardText.innerHTML = task.text + "<br/>" + "Установленная дата " + task.date;

            let btnEdit = document.createElement('a');
            btnEdit.className = "btn btn-primary btn-edit";
            btnEdit.text = "Отредактировать";

            let btnDelete = document.createElement('a');
            btnDelete.className = "btn btn-danger btn-delete";
            btnDelete.text = "Удалить";

            cardBody.appendChild(cardTitle)
            cardBody.appendChild(cardText);

            let cardFooter = document.createElement('div');
            cardFooter.className = "card-footer";

            if (!task.is_completed) {
                let btnComplete = document.createElement('a');
                btnComplete.className = "btn btn-success btn-complete";
                btnComplete.text = "Отметить выполненным";
                cardFooter.appendChild(btnComplete)
            }
            cardFooter.appendChild(btnEdit);
            cardFooter.appendChild(btnDelete);

            card.appendChild(cardBody)
            card.appendChild(cardFooter);
            card.setAttribute("task_id", task.id);

            tasks.appendChild(card);
        })

        const paginationUl = document.querySelector("#pagination_ul");
        const paginationTasks = tasks.querySelectorAll("div.card");
        const paginationLimit = 5;
        const pageCount = Math.ceil(paginationTasks.length / paginationLimit);

        const appendNumber = (number) => {
            const pageListItem = document.createElement("li");
            pageListItem.className = "page-item";
            const pageLink = document.createElement("a");
            pageLink.className = "page-link";
            pageLink.text = number;
            pageLink.setAttribute("page-index", number);

            pageListItem.appendChild(pageLink);
            paginationUl.appendChild(pageListItem);
        }

        const handleActivePageNumber = () => {
            document.querySelectorAll(".page-link").forEach((button) => {
                button.classList.remove("active");
                const pageIndex = Number(button.getAttribute("page-index"));
                if (pageIndex === currentPage) {
                    button.classList.add("active");
                }
            });
        }

        const drawNumbers = () => {
            paginationUl.innerHTML = "";
            for (let i = 1; i <= pageCount; i++)
            {
                appendNumber(i)
            }
        }

        drawNumbers();

        const setCurrentPage = (pageNum) => {
            currentPage = pageNum;

            const prevRange = (pageNum - 1) * paginationLimit;

            const currRange = pageNum * paginationLimit;

            paginationTasks.forEach((item, index) => {

                item.classList.add("hidden");

                if (index >= prevRange && index < currRange) {
                    item.classList.remove("hidden");
                }
            });

            handleActivePageNumber()
        };

        document.querySelectorAll(".page-link").forEach((button) => {
            const pageIndex = Number(button.getAttribute("page-index"));
            if (pageIndex) {
                button.addEventListener("click", (event) => {
                    setCurrentPage(pageIndex)
                })
            }
        })

        let page = currentPage == null ? 1 : currentPage;
        if (page > pageCount) {
            page = 1;
        }
        setCurrentPage(page)

        addButtonsListeners()
    }

    const editModal = new bootstrap.Modal(document.querySelector("#editTaskModal"));

    document.querySelector("#edit__task").addEventListener("submit", (event) => {
        event.preventDefault()
        let button = event.target.querySelector('.btn-save');
        button.setAttribute('disabled', '')
        button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
            "            <span class=\"sr-only\">Сохраняем задачу...</span>";

        let elements = event.target.elements
        sendPostRequest("/tasks/edit/" + elements.task_id.value, {
            text: elements.task_text.value,
            date: elements.task_date.value
        })
            .then((result) => {
                button.removeAttribute('disabled')
                button.innerHTML = ""
                button.textContent = "Сохранить"

                result = JSON.parse(result);
                if (result.error != null)
                {
                    result.error.forEach((error) => {
                        alert(error)
                    })
                } else {
                    tasksArray.forEach((item, index) => {
                        if (item.id === result.id) {
                            tasksArray[index] = result;
                        }
                    })
                    displayTasks(tasksArray)
                    editModal.hide();
                }
            })
    });

    let deleteConfirmModal = new bootstrap.Modal(document.querySelector("#confirmDeleteModal"));
    let taskDeleteForm = document.querySelector("#task_delete_form");
    taskDeleteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let button = event.target.querySelector("button");
        let task_id = event.target.querySelector("input").value;

        button.setAttribute('disabled', '')
        button.classList.add('disabled')
        button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
            "            <span class=\"sr-only\">Удаляем задачу...</span>";

        sendPostRequest('/tasks/delete/' + task_id, {})
            .then((result) => {
                result = JSON.parse(result);
                if (result.success != null) {
                    deleteConfirmModal.hide();
                    tasksArray.forEach((item, index) => {
                        if (item.id == task_id) {
                            tasksArray.splice(index, 1)
                        }
                    })
                    displayTasks(tasksArray)
                } else {
                    alert(result.error.message);
                    button.removeAttribute('disabled')
                    button.innerHTML = "";
                    button.textContent = "Удалить задачу"
                }
            })
    })

    const addButtonsListeners = () => {
        document.querySelectorAll('.btn-edit').forEach((button) => {
            button.addEventListener('click', (event) => {
                let card = event.target.parentElement.parentElement;
                let task_id = Number(card.getAttribute("task_id"));
                let task = tasksArray.find(element => element.id === task_id);
                document.querySelector("#task_text").value = task.text;
                document.querySelector("#task_id").value = task_id;
                let date = new Date(task.date);
                document.querySelector("#task_date").value = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
                editModal.show();
            })
        });

        document.querySelectorAll(".btn-delete").forEach((button) => {
            button.addEventListener("click", (event) => {
                let card = event.target.parentElement.parentElement;
                let task_id = Number(card.getAttribute("task_id"));

                taskDeleteForm.querySelector("input").value = task_id;
                document.querySelector("#confirmDeleteModal").querySelector(".modal-body").innerHTML = "<p>Вы хотите удалить задачу с ID "+task_id+"?</p>"
                deleteConfirmModal.show();
            })
        });

        document.querySelectorAll(".btn-complete").forEach((button) => {
            button.addEventListener("click", (event) => {
                let card = event.target.parentElement.parentElement;
                let task_id = Number(card.getAttribute("task_id"));

                button.setAttribute('disabled', '')
                button.classList.add('disabled')
                button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                    "            <span class=\"sr-only\">Отмечаем задачу...</span>";

                sendPostRequest('/tasks/complete/' + task_id, {})
                    .then((result) => {
                        let task = JSON.parse(result);
                        tasksArray.forEach((item, index) => {
                            if (item.id === task.id) {
                                tasksArray[index] = task;
                            }
                        })
                        displayTasks(tasksArray)
                    })
                    .catch((error) => {
                        alert('Произошла ошибка')
                        console.log(error)
                        button.removeAttribute('disabled')
                        button.innerHTML = "";
                        button.textContent = "Отметить выполенным";
                    })
            })
        })
    };

    getAndDisplayTasks()
}

const auth__form = document.querySelector('#auth__form');
if (auth__form !== null) {
    auth__form.addEventListener('submit', (event) => {
        event.preventDefault();
        let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
        let email = event.target.elements.email.value;

        if (!regex.test(email)) {
            alert("Почта введена неверно!")
            return;
        }

        let button = auth__form.querySelector('button');

        button.setAttribute('disabled', '')
        button.classList.add('disabled')
        button.innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
            "            <span class=\"sr-only\">Выполняем вход...</span>";

        sendPostRequest('/auth/handle', {
            email: email
        }).then((result) => {
            result = JSON.parse(result);
            if (result.error != null) {
                button.removeAttribute('disabled')
                button.classList.remove('disabled')
                button.innerHTML = ""
                button.textContent = "Войти"
                result.error.forEach((error) => {
                    alert(error)
                })
            } else {
                location.href = "/tasks";
            }
        })
    })
}
