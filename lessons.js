/* ============================================================
   CodeVent Labs — Python course lesson content
   One entry per map node (data-lesson id in index.html).

   Lesson shape:
   {
     title, emoji, blurb,          // shown in the map popup
     intro: [                      // swipe-through teaching cards
       { emoji, title, text: [paragraphs], code?, output? }
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
        emoji: '👋',
        blurb: 'Meet Python and write your very first line of code with print().',

        intro: [
            {
                emoji: '🐍',
                title: 'Meet Python',
                text: [
                    'Python is a language that computers understand. When you write instructions in it, we call that code.',
                    'Computers are super fast, but they only do exactly what you tell them. Let\'s learn how to give orders!'
                ]
            },
            {
                emoji: '📣',
                title: 'The print() command',
                text: [
                    'The word print() makes the computer show something on the screen.',
                    'Put what you want to show inside the brackets.'
                ],
                code: 'print("Hello, world!")',
                output: 'Hello, world!'
            },
            {
                emoji: '💬',
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
                explain: 'print("Hi"): the command, brackets, and the text in quotes. You just wrote real Python! 🎉'
            }
        ]
    }

    // Next up: 'l1-2' (Variables), 'l1-3' (Types) …
};
