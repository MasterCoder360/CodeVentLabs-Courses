/* ============================================================
   CodeVent Labs — Python course lesson content
   One entry per map node (data-lesson id in index.html).

   Lesson shape:
   {
     title, icon, blurb,           // shown in the map popup
     xp?,                          // first-time reward (defaults to 15)
     pass?, doneTitle?,            // unit quizzes: % needed to pass, result title
     intro: [                      // swipe-through teaching cards
       { icon, title, text: [paragraphs], code?, output? }
     ],
     questions: [
       // Multiple choice
       { type:'choice', prompt, code?, options:[...], answer:<index>, explain },
       // Type the answer (output or code). Any entry in `answers` is accepted.
       // Set code:true to be forgiving about 'single' vs "double" quotes
       // and spaces around brackets.
       { type:'type', prompt, code?, answers:[...], isCode?, placeholder?, explain }
     ]
   }
   ============================================================ */

const LESSONS = {

    /* ---------------- UNIT 1 · LESSON 1 ---------------- */
    'l1-1': {
        title: 'Say Hello, Python!',
        icon: 'hand',
        blurb: 'Meet Python and write your very first line of code with print().',

        intro: [
            {
                icon: 'python',
                title: 'Meet Python',
                text: [
                    'Python is a language that computers understand. When you write instructions in it, we call that code.',
                    'Computers are super fast, but they only do exactly what you tell them. Let\'s learn how to give orders!'
                ]
            },
            {
                icon: 'megaphone',
                title: 'The print() command',
                text: [
                    'The word print() makes the computer show something on the screen.',
                    'Put what you want to show inside the brackets.'
                ],
                code: 'print("Hello, world!")',
                output: 'Hello, world!'
            },
            {
                icon: 'message-circle',
                title: 'Text needs quotes',
                text: [
                    'Words and sentences are called text. Text always goes inside quote marks "like this". The quotes don\'t show up on screen.',
                    'Numbers don\'t need quotes, and Python can even do maths for you!'
                ],
                code: 'print(7)\nprint(2 + 3)',
                output: '7\n5'
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'What does this code show on the screen?',
                code: 'print("Hi")',
                options: ['Hi', '"Hi"', 'print', 'Nothing'],
                answer: 0,
                explain: 'print() shows what is inside the brackets. The quote marks only tell Python it\'s text, so they don\'t appear.'
            },
            {
                type: 'choice',
                prompt: 'Which line makes the computer show the word Hello?',
                options: ['say Hello', 'show("Hello")', 'print("Hello")', 'display Hello'],
                answer: 2,
                explain: 'In Python the command for showing things is print(), with the text in quotes inside the brackets.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'print("Pizza")',
                answers: ['Pizza'],
                placeholder: 'Type the output…',
                explain: 'The quotes are not shown, so the output is just Pizza.'
            },
            {
                type: 'choice',
                prompt: 'Text in Python goes inside…',
                options: ['Quote marks " "', 'Hashtags # #', 'Curly brackets { }', 'Nothing at all'],
                answer: 0,
                explain: 'Quote marks tell Python "this is text". Another word for text is a string.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'print(7)',
                answers: ['7'],
                placeholder: 'Type the output…',
                explain: 'Numbers don\'t need quotes. print(7) simply shows 7.'
            },
            {
                type: 'choice',
                prompt: 'Oh no, this code has a bug! What is wrong?',
                code: 'print("Hello)',
                options: [
                    'The closing quote is missing',
                    'print should have a capital P',
                    'There are too many brackets',
                    'Nothing, it works fine'
                ],
                answer: 0,
                explain: 'Every opening quote needs a closing quote. It should be print("Hello").'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print(2 + 3)',
                options: ['2 + 3', '23', '5', 'Nothing'],
                answer: 2,
                explain: 'There are no quotes, so Python does the maths first and shows 5.'
            },
            {
                type: 'type',
                prompt: 'Your turn! Type the code that shows the word Hi on the screen.',
                answers: ['print("Hi")'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'print("Hi"): the command, brackets, and the text in quotes. You just wrote real Python!'
            }
        ]
    },

    /* ---------------- UNIT 1 · LESSON 2 ---------------- */
    'l1-2': {
        title: 'Boxes for Your Data',
        icon: 'package',
        blurb: 'Store numbers and text in variables, then use them by name.',

        intro: [
            {
                icon: 'package',
                title: 'A box with a label',
                text: [
                    'A variable is a name that holds a value. Picture a labelled box: the label is the name, and the value sits inside.',
                    'You make one with an equals sign. The name goes on the left, the value on the right.'
                ],
                code: 'name = "Ada"'
            },
            {
                icon: 'pencil',
                title: 'Use the name, not the value',
                text: [
                    'Once a value has a name, you can use that name anywhere. Python opens the box and swaps in what\'s inside.',
                    'Here print() shows whatever the variable holds.'
                ],
                code: 'name = "Ada"\nprint(name)',
                output: 'Ada'
            },
            {
                icon: 'refresh-cw',
                title: 'Values can change',
                text: [
                    'That\'s why they\'re called variables! If you give the same name a new value, the box is emptied and refilled.',
                    'Only the newest value stays inside.'
                ],
                code: 'score = 10\nscore = 25\nprint(score)',
                output: '25'
            },
            {
                icon: 'ruler',
                title: 'Naming rules',
                text: [
                    'Variable names can use letters, numbers and underscores, but they cannot start with a number and cannot have spaces.',
                    'Capital letters matter: Age and age are two different boxes.'
                ],
                code: 'my_score = 5\nscore2 = 10\nprint(my_score + score2)',
                output: '15'
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'What is a variable?',
                options: [
                    'A name that holds a value',
                    'A command that shows text',
                    'A kind of quote mark',
                    'A mistake in the code'
                ],
                answer: 0,
                explain: 'A variable is a name for a value. You create it with name = value and use the name later.'
            },
            {
                type: 'choice',
                prompt: 'What did this code just do?',
                code: 'name = "Sam"',
                options: [
                    'Stored the text Sam in a variable called name',
                    'Showed Sam on the screen',
                    'Asked the user to type a name',
                    'Created a variable called Sam'
                ],
                answer: 0,
                explain: 'The equals sign stores a value. Nothing appears on screen until you print it.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'score = 42\nprint(score)',
                answers: ['42'],
                placeholder: 'Type the output…',
                explain: 'print(score) shows what is inside score, which is 42.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'pet = "cat"\npet = "dog"\nprint(pet)',
                options: ['cat', 'dog', '"dog"', 'catdog'],
                answer: 1,
                explain: 'The name pet can only hold one value. The second line replaces cat with dog, so dog is what gets printed.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'x = 4\nx = x + 1\nprint(x)',
                answers: ['5'],
                placeholder: 'Type the output…',
                explain: 'Python takes the old value 4, adds 1, and stores 5 back into x. Then it prints 5.'
            },
            {
                type: 'choice',
                prompt: 'Which of these variable names is NOT allowed in Python?',
                options: ['2fast', 'fast2', 'my_score', '_score'],
                answer: 0,
                explain: 'A name may contain numbers but cannot start with one. 2fast is not a valid name.'
            },
            {
                type: 'choice',
                prompt: 'Which line creates a variable called age holding the number 12?',
                options: ['age = 12', '12 = age', 'age == 12', 'variable age 12'],
                answer: 0,
                explain: 'The name always goes on the left of a single equals sign: age = 12. Two equals signs (==) are used for comparing instead.'
            },
            {
                type: 'type',
                prompt: 'Your turn! Store the number 7 in a variable called lucky.',
                answers: ['lucky = 7'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'lucky = 7 puts 7 in a box labelled lucky. Nothing is printed yet, because storing is not showing.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'apples = 3\npears = 2\nprint(apples + pears)',
                answers: ['5'],
                placeholder: 'Type the output…',
                explain: 'The names swap in their values, so this is print(3 + 2), which shows 5.'
            },
            {
                type: 'type',
                prompt: 'Now store the word Python in a variable called language.',
                answers: ['language = "Python"'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'Text needs quotes: language = "Python". Single quotes work too.'
            }
        ]
    },

    /* ---------------- UNIT 1 · LESSON 3 ---------------- */
    'l1-3': {
        title: 'Know Your Types',
        icon: 'shapes',
        blurb: 'Numbers, text and true/false are different types — and quotes decide which.',

        intro: [
            {
                icon: 'shapes',
                title: 'Every value has a type',
                text: [
                    'Values are not all the same kind. A number, a piece of text and a yes/no answer are different types.',
                    'Python remembers the type of every value, and the type decides what it can do with it.'
                ],
                code: 'print(7)'
            },
            {
                icon: 'message-circle',
                title: 'Text: str',
                text: [
                    'Text values are called strings, or str for short. They always wear quotes.',
                    'The quotes are not part of the text — they are just how you tell Python it is a string.'
                ],
                code: 'name = "Ada"\nprint(name)',
                output: 'Ada'
            },
            {
                icon: 'ruler',
                title: 'Numbers: int and float',
                text: [
                    'Whole numbers are int, short for integer. Numbers with a decimal point are float.',
                    'Numbers never use quotes.'
                ],
                code: 'year = 2026\nprice = 4.5\nprint(year)\nprint(price)',
                output: '2026\n4.5'
            },
            {
                icon: 'toggle-right',
                title: 'Yes or no: bool',
                text: [
                    'A boolean holds only True or False. The first letter is a capital and there are no quotes.',
                    'Booleans are handy for things like whether a level has been finished.'
                ],
                code: 'finished = False\nprint(finished)',
                output: 'False'
            },
            {
                icon: 'sparkles',
                title: 'Same look, different type',
                text: [
                    '7 is a number, but "7" is text that happens to look like a number. Python treats them differently.',
                    'Numbers get added. Strings get joined together, end to end.'
                ],
                code: 'print(7 + 3)\nprint("7" + "3")',
                output: '10\n73'
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'Which of these values is a string?',
                options: ['"42"', '42', '4.2', 'True'],
                answer: 0,
                explain: 'Only "42" is inside quotes, so only "42" is text. 42 and 4.2 are numbers and True is a boolean.'
            },
            {
                type: 'choice',
                prompt: 'What type is the value 3.14?',
                options: ['float', 'int', 'str', 'bool'],
                answer: 0,
                explain: 'A number with a decimal point is a float. 3 is an int, "3.14" would be a str.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'print("7 + 3")',
                answers: ['7 + 3'],
                placeholder: 'Type the output…',
                explain: 'The quotes make the whole thing a string, so Python shows it as it is instead of doing the maths.'
            },
            {
                type: 'choice',
                prompt: 'And what does this one show?',
                code: 'print(7 + 3)',
                options: ['10', '73', '7 + 3', 'Error'],
                answer: 0,
                explain: 'With no quotes these are numbers, so Python adds them: 10. With quotes it would be text: 73.'
            },
            {
                type: 'choice',
                prompt: 'Which of these values is a boolean?',
                options: ['True', '"True"', 'true', '1'],
                answer: 0,
                explain: 'A boolean is True or False with a capital first letter and no quotes. "True" is text and true is not a Python value.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'price = 2.5\nprint(price)',
                answers: ['2.5'],
                placeholder: 'Type the output…',
                explain: 'price holds the float 2.5, and print() shows it exactly as it is.'
            },
            {
                type: 'choice',
                prompt: 'What type is the value 42?',
                options: ['int', 'float', 'str', 'bool'],
                answer: 0,
                explain: 'A whole number with no decimal point is an int (integer).'
            },
            {
                type: 'type',
                prompt: 'Your turn! Store the number 12 in a variable called age.',
                answers: ['age = 12'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'age = 12 stores the int 12. No quotes, because quotes would make it the text "12".'
            },
            {
                type: 'choice',
                prompt: 'Which line stores the text Paris in a variable?',
                options: ['city = "Paris"', 'city = Paris', 'city = 3.5', 'city = False'],
                answer: 0,
                explain: 'Without quotes Python looks for a variable called Paris, which does not exist. Text needs quotes: "Paris".'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'flag = False\nprint(flag)',
                answers: ['False'],
                placeholder: 'Type the output…',
                explain: 'flag holds the boolean False, and print() shows it with the capital F.'
            }
        ]
    },

    /* ---------------- UNIT 1 · LESSON 4 ---------------- */
    'l1-4': {
        title: 'Do the Math',
        icon: 'calculator',
        blurb: 'Add, subtract, multiply and divide — and see why division hands back a decimal.',

        intro: [
            {
                icon: 'calculator',
                title: 'Python is a calculator',
                text: [
                    'Python can do maths for you. You write the sum, and Python works out the answer.',
                    'Put the sum inside print() and the answer appears on the screen.'
                ],
                code: 'print(2 + 3)',
                output: '5'
            },
            {
                icon: 'pencil',
                title: 'Four signs to know',
                text: [
                    'Python uses the same four signs as a calculator: + to add, - to subtract, * to multiply and / to divide.',
                    'The star * means times. It is not the letter x.'
                ],
                code: 'print(4 + 6)\nprint(9 - 3)\nprint(3 * 5)',
                output: '10\n6\n15'
            },
            {
                icon: 'zap',
                title: 'Dividing gives a decimal',
                text: [
                    'Here is a surprise. Division with / always gives a float, even when the answer is a whole number.',
                    'So 10 / 5 is not 2, it is 2.0. A number with a .0 is still a perfectly good answer.'
                ],
                code: 'print(10 / 5)\nprint(9 / 2)',
                output: '2.0\n4.5'
            },
            {
                icon: 'refresh-cw',
                title: 'Maths with variables',
                text: [
                    'Variables are good at maths too. Python swaps in the value inside each name, then works out the sum.',
                    'You can even use a variable to update itself: score = score + 5 means take the old score, add 5, and store it back.'
                ],
                code: 'score = 10\nscore = score + 5\nprint(score)',
                output: '15'
            },
            {
                icon: 'heart-crack',
                title: 'Text and numbers do not mix',
                text: [
                    'The plus sign joins two strings together, but it cannot join a string to a number. Python stops with an error instead of guessing.',
                    'If you need both, keep the number as a separate print() for now.'
                ],
                code: 'print("Hi, " + "Ada")\nprint("Age: " + 12)',
                output: 'Hi, Ada\nTypeError: can only concatenate str (not "int") to str'
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print(5 + 4)',
                options: ['9', '54', '5 + 4', 'Error'],
                answer: 0,
                explain: 'With no quotes these are numbers, so Python adds them: 9.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print(10 / 2)',
                options: ['5.0', '5', '5.5', 'Error'],
                answer: 0,
                explain: 'Division with / always gives a float, even for a whole answer, so you get 5.0 rather than 5.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'print(7 * 6)',
                answers: ['42'],
                placeholder: 'Type the output…',
                explain: 'The star means times, so 7 * 6 is 42.'
            },
            {
                type: 'choice',
                prompt: 'Which sign does Python use to multiply?',
                options: ['*', '/', 'x', '^'],
                answer: 0,
                explain: 'The star * multiplies. The letter x is not an operator, and / divides.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'print(20 - 8)',
                answers: ['12'],
                placeholder: 'Type the output…',
                explain: 'The minus sign subtracts, so 20 - 8 is 12.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'score = 10\nscore = score + 5\nprint(score)',
                options: ['15', '10', '5', '105'],
                answer: 0,
                explain: 'The second line takes the old 10, adds 5, and stores 15 back into score. Then 15 is printed.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print("2" + "3")',
                options: ['23', '5', '2 + 3', 'Error'],
                answer: 0,
                explain: 'These are strings, so the plus sign joins them end to end: 23. With no quotes it would be 5.'
            },
            {
                type: 'type',
                prompt: 'Your turn! Store the answer to 8 + 4 in a variable called total.',
                answers: ['total = 8 + 4'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'Python works out 8 + 4 first and stores 12 in total. Nothing is printed until you print it.'
            },
            {
                type: 'choice',
                prompt: 'What happens when this code runs?',
                code: 'print("Score: " + 10)',
                options: [
                    'It stops with an error, because text cannot be joined to a number',
                    'It shows Score: 10',
                    'It shows 10',
                    'It shows Score: 1010'
                ],
                answer: 0,
                explain: 'The left side is a string and the right side is an int. The plus sign cannot join them, so Python raises a TypeError.'
            },
            {
                type: 'type',
                prompt: 'Last one. What does this code show? Type it exactly.',
                code: 'print(9 / 3)',
                answers: ['3.0'],
                placeholder: 'Type the output…',
                explain: 'Division with / gives a float, so 9 / 3 is 3.0 and not 3.'
            }
        ]
    },

    /* ---------------- UNIT 1 · QUIZ (trophy node) ---------------- */
    'trophy-u1': {
        title: 'Unit 1 Quiz',
        icon: 'trophy',
        blurb: 'The Unit 1 boss: 12 questions on print(), variables, types and maths. Score 80% to pass.',
        pass: 80,
        xp: 40,
        doneTitle: 'Unit 1 complete!',

        intro: [
            {
                icon: 'trophy',
                title: 'Unit 1 Quiz',
                text: [
                    'Time to prove it. Twelve questions from all four lessons: showing text, variables, types and maths.',
                    'Score 80% or more to pass. A wrong answer costs a heart and comes back at the end, so read each one twice.'
                ]
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'Which line makes the computer show the word Hello?',
                options: ['print("Hello")', 'say Hello', 'show("Hello")', 'display Hello'],
                answer: 0,
                explain: 'print() with the text in quotes is how Python shows something on screen.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'print("Taco")',
                answers: ['Taco'],
                placeholder: 'Type the output…',
                explain: 'The quotes mark the text but are never shown, so the output is Taco.'
            },
            {
                type: 'choice',
                prompt: 'What did this code just do?',
                code: 'score = 10',
                options: [
                    'Stored the number 10 in a variable called score',
                    'Showed 10 on the screen',
                    'Added 10 to an existing score',
                    'Created a variable called 10'
                ],
                answer: 0,
                explain: 'A single equals sign stores a value under the name on its left. Nothing is shown until you print it.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'pet = "cat"\npet = "dog"\nprint(pet)',
                answers: ['dog'],
                placeholder: 'Type the output…',
                explain: 'A variable holds one value at a time. The second line replaces cat with dog, and quotes are not printed.'
            },
            {
                type: 'choice',
                prompt: 'What is the type of the value "12"?',
                options: ['str', 'int', 'float', 'bool'],
                answer: 0,
                explain: 'The quotes make it text, so it is a str. Without quotes, 12 would be an int.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print(10 / 5)',
                options: ['2.0', '2', '0.5', 'Error'],
                answer: 0,
                explain: 'Division with / always gives a float, even when the answer is whole — so 2.0, not 2.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'print(9 / 3)',
                answers: ['3.0'],
                placeholder: 'Type the output…',
                explain: 'Again / returns a float: 9 / 3 is 3.0.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'x = 5\nx = x + 2\nprint(x)',
                answers: ['7'],
                placeholder: 'Type the output…',
                explain: 'Python takes the old 5, adds 2, stores 7 back into x, then prints 7.'
            },
            {
                type: 'choice',
                prompt: 'Oh no, this code has a bug! What is wrong?',
                code: 'print("Hi)',
                options: [
                    'The closing quote is missing',
                    'print should have a capital P',
                    'There are too many brackets',
                    'Nothing, it works fine'
                ],
                answer: 0,
                explain: 'An opening quote needs a matching closing quote: print("Hi").'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print("2" + "3")',
                options: ['23', '5', '2 + 3', 'Error'],
                answer: 0,
                explain: 'Both values are strings, so the plus sign joins them end to end: 23. Without quotes it would be 5.'
            },
            {
                type: 'choice',
                prompt: 'Which of these variable names is NOT allowed in Python?',
                options: ['2cool', 'cool2', 'my_cool', '_cool'],
                answer: 0,
                explain: 'A name may contain numbers but cannot start with one, so 2cool is invalid.'
            },
            {
                type: 'type',
                prompt: 'Your turn! Store the number 9 in a variable called lives.',
                answers: ['lives = 9'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'lives = 9 puts 9 in a box labelled lives. No quotes, because quotes would make it the text "9".'
            }
        ]
    },

    /* ---------------- UNIT 2 · LESSON 1 ---------------- */
    'l2-1': {
        title: 'Making Decisions',
        icon: 'toggle-right',
        blurb: 'Compare values and use if to run code only when the answer is True.',

        intro: [
            {
                icon: 'brain',
                title: 'A question with two answers',
                text: [
                    'Computers make decisions by answering yes or no questions. In Python those answers are True and False.',
                    'A question like "is 5 bigger than 3?" is a comparison. Python works it out and hands back True or False.'
                ],
                code: 'print(5 > 3)\nprint(5 < 3)',
                output: 'True\nFalse'
            },
            {
                icon: 'ruler',
                title: 'The six comparison signs',
                text: [
                    'Two equals signs ask "are these the same?". The sign != asks "are these different?". Then come > bigger, < smaller, >= at least and <= at most.',
                    'Two equals signs compare, but one equals sign stores a value. They do very different jobs.'
                ],
                code: 'print(10 == 10)\nprint(10 != 10)\nprint(4 >= 4)',
                output: 'True\nFalse\nTrue'
            },
            {
                icon: 'toggle-right',
                title: 'The if statement',
                text: [
                    'An if statement guards a block of code. Python runs that block only when the comparison is True.',
                    'Write if, then the question, then a colon. The next line is indented to show that it belongs to the if.'
                ],
                code: 'if 7 > 3:\n    print("Bigger!")',
                output: 'Bigger!'
            },
            {
                icon: 'ruler',
                title: 'Indentation is the boss',
                text: [
                    'Python uses indentation instead of curly brackets. Everything indented under the if is inside it, and a line back at the left edge is outside it.',
                    'Four spaces is the usual indent. Mixing spaces and tabs upsets Python, so pick one and stick to it.'
                ],
                code: 'if 10 > 5:\n    print("inside the if")\nprint("always runs")',
                output: 'inside the if\nalways runs'
            },
            {
                icon: 'eye-off',
                title: 'When the answer is False',
                text: [
                    'If the comparison is False, Python skips the indented block and carries on with the next line.',
                    'That is how one program can behave differently every time it runs.'
                ],
                code: 'lives = 0\nif lives > 0:\n    print("Keep playing")\nprint("Game over")',
                output: 'Game over'
            }
        ],

        questions: [
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'print(8 > 3)',
                options: ['True', 'False', '8 > 3', 'Error'],
                answer: 0,
                explain: '8 is bigger than 3, so the comparison is True. print() shows it with a capital T.'
            },
            {
                type: 'type',
                prompt: 'What does this code show? Type it exactly.',
                code: 'print(4 == 4)',
                answers: ['True'],
                placeholder: 'Type the output…',
                explain: 'Two equals signs ask whether the values are the same. 4 and 4 are, so the answer is True.'
            },
            {
                type: 'choice',
                prompt: 'Which sign asks whether two values are equal?',
                options: ['==', '=', '=>', '<>'],
                answer: 0,
                explain: 'A double equals sign == compares. A single = stores a value in a variable, so the two are not interchangeable.'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'print(6 != 2)',
                answers: ['True'],
                placeholder: 'Type the output…',
                explain: 'The sign != means "not equal". 6 and 2 are different, so the answer is True.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'age = 12\nif age >= 12:\n    print("You can ride")',
                options: ['You can ride', 'Nothing at all', 'True', 'Error'],
                answer: 0,
                explain: '>= means at least. 12 is at least 12, so the comparison is True and the indented print() runs.'
            },
            {
                type: 'choice',
                prompt: 'What does this code show?',
                code: 'score = 3\nif score > 10:\n    print("Winner")\nprint("Done")',
                options: ['Done', 'Winner then Done', 'Nothing at all', 'Error'],
                answer: 0,
                explain: '3 is not bigger than 10, so Python skips the indented block. The last line is not indented, so it always runs.'
            },
            {
                type: 'choice',
                prompt: 'Oh no, this code has a bug! What is wrong?',
                code: 'if 5 > 2\n    print("Yes")',
                options: [
                    'The if line is missing its colon',
                    'print needs a capital P',
                    '5 > 2 is not a question Python can answer',
                    'Nothing, it works fine'
                ],
                answer: 0,
                explain: 'An if line always ends with a colon before the indented block: if 5 > 2:'
            },
            {
                type: 'type',
                prompt: 'What does this code show?',
                code: 'x = 10\nprint(x <= 10)',
                answers: ['True'],
                placeholder: 'Type the output…',
                explain: '<= means at most. 10 is at most 10, so the comparison is True.'
            },
            {
                type: 'choice',
                prompt: 'Which comparison is True when score is at least 100?',
                options: ['score >= 100', 'score > 100', 'score = 100', 'score <= 100'],
                answer: 0,
                explain: '>= means at least, so 100 itself counts. > would need more than 100, and <= means at most.'
            },
            {
                type: 'type',
                prompt: 'Your turn! Type a comparison that is True when speed is more than 50.',
                answers: ['speed > 50'],
                isCode: true,
                placeholder: 'Type your code…',
                explain: 'speed > 50 asks whether speed is bigger than 50. Put it after if, add a colon, and Python is ready to decide.'
            }
        ]
    }
};