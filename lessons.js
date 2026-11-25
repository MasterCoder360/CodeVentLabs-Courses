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
                icon: 'code',
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
    }

    // Next up: 'l1-3' (Types) …
};
