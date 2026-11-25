/* ============================================================
   CodeVent Labs — Python course lesson content
   One entry per map node (data-lesson id in index.html).

   Lesson shape:
   {
     title, icon, blurb,           // shown in the map popup
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
    }
};
