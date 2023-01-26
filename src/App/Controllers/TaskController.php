<?php


namespace Todo\App\Controllers;


use Todo\App\Models\Task;
use Todo\App\Validator;
use Todo\view\View;

class TaskController extends Controller
{
    public function tasks()
    {
        View::view('tasks');
    }

    public function getTasks()
    {
        $tasks = Task::where('created_by', $_SESSION['user_id'])->get();
        $this->response->json($tasks->toArray());
    }

    public function createTask()
    {
        $errors = Validator::validate($this->request, [
            'text' => 'required',
            'is_important' => 'required|int',
            'date' => 'required',
        ]);

        if (!empty($errors)) {
            $this->response->json([
                'error' => $errors
            ]);
            return;
        }

        $task = Task::create([
            'text' => $this->request->post('text'),
            'is_important' => (int)$this->request->post('is_important'),
            'created_by' => $_SESSION['user_id'],
            'date' => $this->request->post('date')
        ]);
        $this->response->json($task->toArray());
    }

    public function editTask(int $id)
    {
        $task = $this->validateAndGetTask($id);
        if ($task == null) return;

        $errors = Validator::validate($this->request, [
            'text' => 'required',
            'date' => 'required'
        ]);
        if (!empty($errors)) {
            $this->response->json([
                'error' => $errors
            ]);
            return;
        }

        $task->update([
            'text' => $this->request->post('text'),
            'date' => $this->request->post('date')
        ]);
        $this->response->json($task->toArray());
    }

    public function deleteTask(int $id)
    {
        $task = $this->validateAndGetTask($id);
        if ($task == null) return;

        $task->delete();
        $this->response->json([
            'success' => [
                'message' => 'Задача с ID ' . $id . ' успешно удалена'
            ]
        ]);
    }

    public function completeTask(int $id)
    {
        $task = $this->validateAndGetTask($id, false); //про кнопку завершено - ничего не сказано, значит завершать таск может любой
        if ($task == null) return;

        $task->update([
            'is_completed' => 1
        ]);
        $this->response->json($task->toArray());
    }

    private function validateAndGetTask(int $id, bool $validateCreatedBy = true)
    {
        $task = Task::where(['id' => $id])->first();

        if ($task === null) {
            $this->response->json([
                'error' => [
                    'message' => 'Задача с ID ' . $id . ' не найдена'
                ]
            ]);
            return null;
        }

        if ($validateCreatedBy) {
            if ($task->created_by !== $_SESSION['user_id']) {
                $this->response->json([
                    'error' => [
                        'message' => 'Задача с ID ' . $id . ' не принадлежит пользователю с id ' . $_SESSION['user_id']
                    ]
                ]);
                return null;
            }
        }

        return $task;
    }
}