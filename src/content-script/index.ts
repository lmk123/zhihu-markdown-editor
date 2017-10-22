import applyQuestion from './question/index'
import applyAnswer from './answer/index'

applyQuestion()

if (window.location.pathname.startsWith('/question/')) applyAnswer()
