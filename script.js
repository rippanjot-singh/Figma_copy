const tool = document.querySelector('#tool')
const canvas = document.querySelector('.canvas-inner')
const toolbar = document.querySelector('.toolbar')
let text = document.querySelector('.text')
let selectedTool = localStorage.getItem('selectedTool') || '';
let toolValue = localStorage.getItem('toolValue') || '';
const imageBtn = document.querySelector('#imageBtn')
const imageInput = document.querySelector('#imageInput')

let textId = parseInt(localStorage.getItem('textId')) || 0;
let rectId = parseInt(localStorage.getItem('rectId')) || 0;
let circleId = parseInt(localStorage.getItem('circleId')) || 0;
let imageId = parseInt(localStorage.getItem('imageId')) || 0;

const layersContainer = document.querySelector('#layers-container')
const leftNav = document.querySelector('.leftnav')
const rightNav = document.querySelector('.rightnav')
const leftCollapseBtn = document.querySelector('.leftnav-top i')
const rightCollapseBtn = document.querySelector('.rightnav-top i')
const exportJsonBtn = document.querySelector('.export p:nth-child(1)')
const exportHtmlBtn = document.querySelector('.export p:nth-child(2)')

const propWidth = document.querySelector('#prop-width')
const propHeight = document.querySelector('#prop-height')
const propX = document.querySelector('#prop-x')
const propY = document.querySelector('#prop-y')
const propFill = document.querySelector('#prop-fill')
const propFillText = document.querySelector('#prop-fill-text')
const propRadius = document.querySelector('#prop-radius')
const propRotation = document.querySelector('#prop-rotation')
const propRotationRange = document.querySelector('#prop-rotation-range')
const propTextContent = document.querySelector('#prop-text-content')
const textPropsSection = document.querySelector('#text-properties')

if (selectedTool === 'shape') {
    tool.style.backgroundColor = '#1e1e1e'
    if (toolValue) tool.value = toolValue
} else if (selectedTool === 'text') {
    text.style.backgroundColor = '#1e1e1e'
}

imageBtn.onclick = function() {
    imageInput.click()
}

leftCollapseBtn.onclick = function() {
    leftNav.classList.toggle('collapsed')
}

rightCollapseBtn.onclick = function() {
    rightNav.classList.toggle('collapsed')
}

exportJsonBtn.onclick = function() {
    let savedData = localStorage.getItem('canvasElements')
    if (savedData == null) return

    let elements = JSON.parse(savedData)
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].classList) {
            elements[i].classList = elements[i].classList.filter(c => c !== 'selected')
        }
    }

    let blob = new Blob([JSON.stringify(elements)], { type: 'application/json' })
    let url = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.href = url
    link.download = 'design.json'
    link.click()
}

exportHtmlBtn.onclick = function() {
    let saved = localStorage.getItem('canvasElements')
    if (!saved) return
    let elements = JSON.parse(saved)

    let htmlStart = '<!DOCTYPE html><html><head><style>' +
        'body { margin: 0; background: #0a0a0a; } ' +
        '.canvas { position: relative; width: 100vw; height: 100vh; }' +
        '</style></head><body><div class="canvas">'

    let htmlContent = ""
    for (let i = 0; i < elements.length; i++) {
        let e = elements[i]
        let style = "position:absolute; top:" + e.top + "; left:" + e.left + "; width:" + e.width + "; height:" + e.height + 
                    "; background-color:" + e.backgroundColor + "; border-radius:" + e.borderRadius + "; color:" + e.color + 
                    "; font-size:" + e.fontSize + "; opacity:" + (e.opacity || 1) + "; transform:" + (e.transform || 'none') + ";"
        
        if (e.backgroundImage) {
            // Fix: Escape double quotes in the background image url or use single quotes for the style attribute
            // We'll replace double quotes in the url(...) with single quotes for safety in the exported HTML's style="..." attribute
            let bg = e.backgroundImage.replace(/"/g, "'");
            style += " background-image:" + bg + "; background-size:cover; background-position:center;"
        }

        if (e.type === 'text') {
            htmlContent += '<p style="' + style + ' white-space:nowrap; margin:0;">' + e.innerText + '</p>'
        } else {
            htmlContent += '<div style="' + style + '"></div>'
        }
    }

    let htmlEnd = '</div></body></html>'
    let blob = new Blob([htmlStart + htmlContent + htmlEnd], { type: 'text/html' })
    let url = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.href = url
    link.download = 'design.html'
    link.click()
}

imageInput.onchange = function(e) {
    let file = e.target.files[0]
    if (!file) return

    let reader = new FileReader()
    reader.onload = function() {
        let imgDiv = document.createElement('div')
        imgDiv.style.backgroundImage = "url(" + reader.result + ")"
        imgDiv.style.backgroundSize = 'cover'
        imgDiv.style.backgroundPosition = 'center'
        imgDiv.id = "image-" + imageId
        imageId = imageId + 1
        imgDiv.classList.add('shape', 'image-div')
        imgDiv.style.position = 'absolute'
        imgDiv.style.top = '300px'
        imgDiv.style.left = '500px'
        imgDiv.style.width = '300px'
        imgDiv.style.height = '300px'
        
        addDots(imgDiv)
        canvas.appendChild(imgDiv)
        localStorage.setItem('imageId', imageId)
        saveCanvasState()
    }
    reader.readAsDataURL(file)
}

tool.onchange = function() {
    toolValue = tool.value
    localStorage.setItem('toolValue', toolValue)
}

tool.onclick = function() {
    if (tool.selectedIndex > 0) {
        text.style.backgroundColor = 'transparent'
        selectedTool = 'shape'
        tool.style.backgroundColor = '#1e1e1e'
        localStorage.setItem('selectedTool', selectedTool)
    }
}

text.onclick = function() {
    tool.style.backgroundColor = 'transparent'
    selectedTool = 'text'
    text.style.backgroundColor = '#1e1e1e'
    localStorage.setItem('selectedTool', selectedTool)
}

function makeText(event) {
    let p = document.createElement('p')
    let rect = canvas.getBoundingClientRect()
    p.id = "text-" + textId
    textId = textId + 1
    p.innerText = 'text'
    p.style.position = 'absolute'
    p.style.top = (event.clientY - rect.top + canvas.scrollTop) + "px"
    p.style.left = (event.clientX - rect.left + canvas.scrollLeft) + "px"
    p.style.width = 'fit-content'
    p.style.height = 'fit-content'
    p.style.color = 'white'
    p.style.fontSize = '16px'
    p.style.whiteSpace = 'nowrap'
    p.classList.add('shape')
    
    addDots(p)
    canvas.appendChild(p)
    localStorage.setItem('textId', textId)

    selectedTool = ''
    text.style.backgroundColor = 'transparent'
    localStorage.setItem('selectedTool', selectedTool)
    saveCanvasState()
}

function addDots(parent) {
    let cornerContainer = document.createElement('div')
    cornerContainer.classList.add('corner')
    
    let positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    
    for (let i = 0; i < 4; i++) {
        let dot = document.createElement('div')
        dot.classList.add('dots')
        dot.classList.add(positions[i])
        dot.style.position = 'absolute'
        dot.style.width = '10px'
        dot.style.height = '10px'
        dot.style.backgroundColor = 'white'
        
        if (i == 0) { dot.style.top = '-5px'; dot.style.left = '-5px' }
        if (i == 1) { dot.style.top = '-5px'; dot.style.right = '-5px' }
        if (i == 2) { dot.style.bottom = '-5px'; dot.style.left = '-5px' }
        if (i == 3) { dot.style.bottom = '-5px'; dot.style.right = '-5px' }
        
        dot.onmousedown = function(e) {
            startResizing(e, positions[i], parent)
        }
        cornerContainer.appendChild(dot)
    }
    parent.appendChild(cornerContainer)
}

function makeShape(event) {
    let rect = canvas.getBoundingClientRect()
    let shape = document.createElement('div')
    shape.classList.add('shape')
    if (toolValue) shape.classList.add(toolValue)

    shape.style.backgroundColor = 'pink'
    shape.style.width = '300px'
    shape.style.height = '300px'
    shape.style.position = 'absolute'
    shape.style.top = (event.clientY - rect.top + canvas.scrollTop) + "px"
    shape.style.left = (event.clientX - rect.left + canvas.scrollLeft) + "px"

    if (toolValue === 'circle') {
        shape.id = "circle-" + circleId
        circleId = circleId + 1
        shape.style.borderRadius = '50%'
        localStorage.setItem('circleId', circleId)
    } else {
        shape.id = "rectangle-" + rectId
        rectId = rectId + 1
        localStorage.setItem('rectId', rectId)
    }

    addDots(shape)
    canvas.appendChild(shape)
    toolValue = ''
    tool.selectedIndex = 0
    tool.style.backgroundColor = 'transparent'
    saveCanvasState()
}

let activeResizeElement = null
let resizeType = null
let startWidth, startHeight, startX, startY, startLeft, startTop, startFontSize

function startResizing(e, type, el) {
    e.stopPropagation()
    activeResizeElement = el
    resizeType = type
    startX = e.clientX
    startY = e.clientY
    startWidth = parseFloat(getComputedStyle(el).width)
    startHeight = parseFloat(getComputedStyle(el).height)
    startLeft = parseFloat(el.style.left)
    startTop = parseFloat(el.style.top)
    startFontSize = parseFloat(getComputedStyle(el).fontSize)
    dragging = true
}

document.addEventListener('mousemove', function(e) {
    if (activeResizeElement == null) return

    let dx = e.clientX - startX
    let dy = e.clientY - startY

    if (resizeType.includes('right')) {
        activeResizeElement.style.width = (startWidth + dx) + "px"
    }
    if (resizeType.includes('bottom')) {
        activeResizeElement.style.height = (startHeight + dy) + "px"
    }
    if (resizeType.includes('left')) {
        let newWidth = startWidth - dx
        if (newWidth > 10) {
            activeResizeElement.style.left = (startLeft + dx) + "px"
            activeResizeElement.style.width = newWidth + "px"
        }
    }
    if (resizeType.includes('top')) {
        let newHeight = startHeight - dy
        if (newHeight > 10) {
            activeResizeElement.style.top = (startTop + dy) + "px"
            activeResizeElement.style.height = newHeight + "px"
        }
    }

    if (activeResizeElement.tagName === 'P') {
        let currentHeight = parseFloat(activeResizeElement.style.height)
        let ratio = currentHeight / startHeight
        activeResizeElement.style.fontSize = (startFontSize * ratio) + "px"
    }

    updatePropertiesPanel(activeResizeElement)
})

document.addEventListener('mouseup', function() {
    if (activeResizeElement) {
        activeResizeElement = null
        dragging = false
        saveCanvasState()
    }
})

let activeDragElement = null
let startMouseX, startMouseY, startElemX, startElemY
let dragging = false

canvas.onmousedown = function(e) {
    let target = e.target.closest('.shape')
    if (!target) return
    
    activeDragElement = target
    let rect = canvas.getBoundingClientRect()
    startMouseX = e.clientX - rect.left + canvas.scrollLeft
    startMouseY = e.clientY - rect.top + canvas.scrollTop
    startElemX = parseFloat(target.style.left)
    startElemY = parseFloat(target.style.top)
    target.style.cursor = 'move'
    dragging = true
}

document.addEventListener('mousemove', function(e) {
    if (!activeDragElement) return
    
    let rect = canvas.getBoundingClientRect()
    let mouseX = e.clientX - rect.left + canvas.scrollLeft
    let mouseY = e.clientY - rect.top + canvas.scrollTop
    
    let dx = mouseX - startMouseX
    let dy = mouseY - startMouseY
    
    activeDragElement.style.left = (startElemX + dx) + "px"
    activeDragElement.style.top = (startElemY + dy) + "px"
    updatePropertiesPanel(activeDragElement)
})

document.addEventListener('mouseup', function() {
    if (activeDragElement) {
        activeDragElement.style.cursor = 'default'
        activeDragElement = null
        dragging = false
        saveCanvasState()
    }
})

canvas.onclick = function(e) {
    if (dragging) return
    
    let clickedShape = e.target.closest('.shape')
    if (clickedShape) {
        clearSelections()
        clickedShape.classList.add('selected')
        updatePropertiesPanel(clickedShape)
        renderLayers()
        return
    }
    
    clearSelections()
    resetPropertiesPanel()
    renderLayers()
    
    if (e.target !== canvas) return
    
    if (selectedTool === 'shape' && toolValue !== '') {
        makeShape(e)
    } else if (selectedTool === 'text') {
        makeText(e)
    }
}

function clearSelections() {
    let all = document.querySelectorAll('.selected')
    for (let i = 0; i < all.length; i++) {
        all[i].classList.remove('selected')
    }
}

function updatePropertiesPanel(el) {
    if (!el) return
    propWidth.value = Math.round(parseFloat(el.style.width))
    propHeight.value = Math.round(parseFloat(el.style.height))
    propX.value = Math.round(parseFloat(el.style.left))
    propY.value = Math.round(parseFloat(el.style.top))

    let isText = (el.tagName === 'P')
    let color = isText ? el.style.color : el.style.backgroundColor
    
    if (color) {
        let hex = rgbToHex(color)
        propFill.value = hex
        propFillText.value = hex.toUpperCase()
    }

    let radius = el.style.borderRadius
    propRadius.value = radius.replace('px', '') || 0

    let transform = el.style.transform;
    let rotation = 0;
    if (transform && transform.includes('rotate')) {
        let match = transform.match(/rotate\(([-]?\d*\.?\d+)deg\)/);
        if (match) rotation = match[1];
    }
    propRotation.value = rotation;
    propRotationRange.value = rotation;

    if (isText) {
        textPropsSection.style.display = 'block'
        propTextContent.value = el.innerText
    } else {
        textPropsSection.style.display = 'none'
    }
}

function resetPropertiesPanel() {
    propWidth.value = ''
    propHeight.value = ''
    propX.value = ''
    propY.value = ''
    propFill.value = '#000000'
    propFillText.value = ''
    propRadius.value = ''
    propRotation.value = ''
    propRotationRange.value = 0
    textPropsSection.style.display = 'none'
}

function handlePropChange(e) {
    let el = document.querySelector('.selected')
    if (!el) return

    if (e && e.target === propRotationRange) {
        propRotation.value = propRotationRange.value
    } else if (e && e.target === propRotation) {
        propRotationRange.value = propRotation.value
    }

    el.style.width = propWidth.value + "px"
    el.style.height = propHeight.value + "px"
    el.style.left = propX.value + "px"
    el.style.top = propY.value + "px"

    if (el.tagName === 'P') {
        el.style.color = propFillText.value
        el.innerText = propTextContent.value
    } else {
        el.style.backgroundColor = propFillText.value
    }

    let r = propRadius.value
    if (r !== '') el.style.borderRadius = r + "px"

    let rot = propRotation.value
    if (rot !== '') el.style.transform = `rotate(${rot}deg)`
    
    saveCanvasState()
}

let inputs = [propWidth, propHeight, propX, propY, propRadius, propRotation, propRotationRange, propFillText, propTextContent]
for (let i = 0; i < inputs.length; i++) {
    inputs[i].oninput = handlePropChange
}

propFill.oninput = function(e) {
    propFillText.value = e.target.value.toUpperCase()
    handlePropChange()
}

function rgbToHex(rgb) {
    if (rgb.indexOf('#') === 0) return rgb
    let parts = rgb.match(/\d+/g)
    if (!parts) return '#000000'
    let r = parseInt(parts[0]).toString(16).padStart(2, '0')
    let g = parseInt(parts[1]).toString(16).padStart(2, '0')
    let b = parseInt(parts[2]).toString(16).padStart(2, '0')
    return "#" + r + g + b
}

document.onkeydown = function(e) {
    if (e.target.tagName === 'INPUT') return

    let el = document.querySelector('.selected')
    if (!el) return

    if (e.key === 'Backspace' || e.key === 'Delete') {
        el.remove()
        saveCanvasState()
        resetPropertiesPanel()
        return
    }

    let step = e.shiftKey ? 50 : 5
    if (e.key === 'ArrowUp') el.style.top = (parseFloat(el.style.top) - step) + "px"
    else if (e.key === 'ArrowDown') el.style.top = (parseFloat(el.style.top) + step) + "px"
    else if (e.key === 'ArrowLeft') el.style.left = (parseFloat(el.style.left) - step) + "px"
    else if (e.key === 'ArrowRight') el.style.left = (parseFloat(el.style.left) + step) + "px"
    else return

    e.preventDefault()
    updatePropertiesPanel(el)
    saveCanvasState()
}

function renderLayers() {
    layersContainer.innerHTML = ''
    let items = Array.from(canvas.children).filter(c => c.classList.contains('shape'))
    
    for (let i = items.length - 1; i >= 0; i--) {
        let child = items[i]
        let layer = document.createElement('div')
        layer.className = 'layer'
        if (child.classList.contains('selected')) layer.classList.add('active-layer')

        let typeName = 'Rectangle'
        if (child.tagName === 'P') typeName = 'Text'
        else if (child.classList.contains('image-div')) typeName = 'Image'
        else if (child.style.borderRadius === '50%') typeName = 'Circle'

        layer.innerHTML = '<p>' + typeName + ' ' + (child.id.split('-')[1] || '') + '</p>' +
            '<div class="updown">' +
                '<i class="ri-arrow-up-s-line btn-up"></i>' +
                '<i class="ri-arrow-down-s-line btn-down"></i>' +
                '<i class="ri-eye-line btn-eye"></i>' +
            '</div>'

        layer.onclick = function(e) {
            if (e.target.tagName === 'I') return
            clearSelections()
            child.classList.add('selected')
            updatePropertiesPanel(child)
            renderLayers()
        }

        layer.querySelector('.btn-up').onclick = function() {
            if (child.nextElementSibling) {
                canvas.insertBefore(child.nextElementSibling, child)
                saveCanvasState()
            }
        }

        layer.querySelector('.btn-down').onclick = function() {
            if (child.previousElementSibling) {
                canvas.insertBefore(child, child.previousElementSibling)
                saveCanvasState()
            }
        }

        let eye = layer.querySelector('.btn-eye')
        eye.onclick = function() {
            if (child.style.opacity === '0') {
                child.style.opacity = '1'
                eye.className = 'ri-eye-line btn-eye'
            } else {
                child.style.opacity = '0'
                eye.className = 'ri-eye-off-line btn-eye'
            }
            saveCanvasState()
        }

        if (child.style.opacity === '0') eye.className = 'ri-eye-off-line btn-eye'
        layersContainer.appendChild(layer)
    }
}

function saveCanvasState() {
    let list = []
    let shapes = canvas.querySelectorAll('.shape')
    for (let i = 0; i < shapes.length; i++) {
        let s = shapes[i]
        let type = 'rectangle'
        if (s.tagName === 'P') type = 'text'
        else if (s.classList.contains('image-div')) type = 'image'
        else if (s.style.borderRadius === '50%') type = 'circle'

        list.push({
            type: type,
            id: s.id,
            top: s.style.top,
            left: s.style.left,
            width: s.style.width,
            height: s.style.height,
            backgroundColor: s.style.backgroundColor,
            backgroundImage: s.style.backgroundImage,
            borderRadius: s.style.borderRadius,
            color: s.style.color,
            fontSize: s.style.fontSize,
            opacity: s.style.opacity || '1',
            classList: Array.from(s.classList),
            innerText: s.innerText,
            transform: s.style.transform
        })
    }
    localStorage.setItem('canvasElements', JSON.stringify(list))
    renderLayers()
}

function loadCanvasState() {
    let saved = localStorage.getItem('canvasElements')
    if (!saved) return
    
    let list = JSON.parse(saved)
    canvas.innerHTML = ''
    
    for (let i = 0; i < list.length; i++) {
        let data = list[i]
        let el = (data.type === 'text') ? document.createElement('p') : document.createElement('div')
        
        el.id = data.id
        for (let j = 0; j < data.classList.length; j++) {
            el.classList.add(data.classList[j])
        }

        el.style.position = 'absolute'
        el.style.top = data.top
        el.style.left = data.left
        el.style.width = data.width
        el.style.height = data.height
        el.style.backgroundColor = data.backgroundColor
        el.style.backgroundImage = data.backgroundImage
        el.style.backgroundSize = 'cover'
        el.style.borderRadius = data.borderRadius
        el.style.color = data.color
        el.style.fontSize = data.fontSize
        el.style.opacity = data.opacity
        el.style.transform = data.transform || 'none'
        
        if (data.type === 'text') el.innerText = data.innerText
        
        addDots(el)
        canvas.appendChild(el)
    }
    renderLayers()
}

loadCanvasState()