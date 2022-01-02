const calculator = document.querySelector('#calculator')
const ACTIONS = {
  ADD_DIGIT: 'add_digit',
  DELETE_DIGIT: 'delete_digit',
  CHOOSE_OPERATION: 'choose_operation',
  CLEAR: 'clear',
  EVALUATE: 'evaluate'
}

let state = {}

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0
})

function display(array, defaultValue = '', string = '') {
  array.forEach((el) => {
    string += `${el ?? defaultValue} `
  })
  return string
}

function createAction({ type, payload }) {
  let obj = {}
  if (type) {
    obj.type = type
  }
  if (payload) {
    obj.payload = payload
  }
  return obj
}

function formatOperand(operand) {
  if (operand == null || operand == 'undefined') return
  const [integer, decimal] = operand.toString().split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const curr = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(curr)) {
    return ''
  }
  let computation = ''
  switch (operation) {
    case '+':
      computation = prev + curr
      break
    case '-':
      computation = prev - curr
      break
    case 'X':
      computation = prev * curr
      break
    case '/':
      computation = prev / curr
  }

  return computation.toString()
}

function reducers(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite == true) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      if (
        state.currentOperand &&
        payload.digit == '0' &&
        state.currentOperand == '0'
      ) {
        return state
      }
      if (
        state.currentOperand &&
        payload.digit === '.' &&
        state.currentOperand.includes('.')
      ) {
        return state
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`
      }
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    case ACTIONS.CLEAR:
      return {
        ...state,
        currentOperand: '0'
      }
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: '0'
        }
      }
      if (state.currentOperand == null) {
        return {
          ...state,
          currentOperand: '0'
        }
      }
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: '0'
        }
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.previousOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      }
  }
}

function dispatch({ type, payload }) {
  state = reducers(state, { type, payload })
}

function calculate(e) {
  if (e.target.tagName.toLowerCase() !== 'button') {
    return
  }
  const current = document.querySelector('#current')
  const previous = document.querySelector('#previous')

  const types = {
    operation: ACTIONS.CHOOSE_OPERATION,
    digit: ACTIONS.ADD_DIGIT,
    clear: ACTIONS.CLEAR,
    evaluate: ACTIONS.EVALUATE,
    delete: ACTIONS.DELETE_DIGIT
  }
  const action = createAction({
    type: types[e.target.dataset.type],
    payload: { [e.target.dataset.type]: e.target.value.toString() }
  })
  dispatch(action)
  previous.innerText = display([
    formatOperand(state.previousOperand),
    state.operation
  ])
  current.innerText = display([formatOperand(state.currentOperand)])
}

// **********************************************************************
// IMPLEMENTATION
// **********************************************************************

calculator.addEventListener('click', calculate)
