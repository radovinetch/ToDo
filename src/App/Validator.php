<?php


namespace Todo\App;


use Todo\App\Http\Request;

class Validator
{
    public static function validate(Request $request, array $validate): array
    {
        $all = array_merge($request->getAll(), $request->postAll());
        $errors = [];
        foreach ($validate as $key => $validatorString) {
            $value = $all[$key] ?? null;
            $parse = explode('|', $validatorString);
            foreach ($parse as $validatorItem) {
                switch ($validatorItem) {
                    case 'int':
                        if (filter_var($value, FILTER_VALIDATE_INT) === false) {
                            $errors[] = 'Параметр ' . $key . ' должен быть целым числом!';
                        }
                        break;

                    case 'required':
                        if ($value == null) {
                            $errors[] = 'Параметр ' . $key . ' обязательный для заполнения!';
                            continue 3;
                        }
                        break;

                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[] = 'Параметр ' . $key . ' должен быть электронной почтой!';
                        }
                        break;

                    default:
                        if (preg_match_all('#^(?P<type>min|max)?\:(?P<length>\d+)$#', $validatorItem, $matches) != 0) {
                            $type = array_shift($matches['type']);
                            $length = array_shift($matches['length']);
                            if ($type == 'min' && strlen((string)$value) < $length) {
                                $errors[] = "Параметр " . $key . ' минимальная длина ' . $length;
                            }

                            if ($type == 'max' && strlen((string)$value) > $length) {
                                $errors[] = "Параметр " . $key . " максимальная длина " . $length;
                            }
                        }
                }
            }
        }

        return $errors;
    }
}