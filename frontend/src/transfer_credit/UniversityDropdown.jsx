import { useEffect, useRef, useState } from 'react'
import hkuIcon from '../assets/HKU.png'
import queensIcon from '../assets/Queens.png'
import sfuIcon from '../assets/SFU.png'
import unswIcon from '../assets/UNSW.png'
import uqIcon from '../assets/UQ.png'
import westernIcon from '../assets/Western.png'
import './TransferCredit.css'

const universities = [
  { value: 'queens', label: "Queen's University", icon: queensIcon },
  { value: 'sfu', label: 'Simon Fraser University (SFU)', icon: sfuIcon },
  {
    value: 'hku',
    label: 'The University of Hong Kong (HKU)',
    icon: hkuIcon,
  },
  {
    value: 'uq',
    label: 'The University of Queensland (UQ)',
    icon: uqIcon,
  },
  {
    value: 'unsw',
    label: 'University of New South Wales (UNSW)',
    icon: unswIcon,
  },
  {
    value: 'western',
    label: 'Western University of Ontario',
    icon: westernIcon,
  },
]

function UniversityImage({ university }) {
  return (
    <span className="university-image">
      <img src={university.icon} alt="" />
    </span>
  )
}

function UniversityDropdown({
  kind,
  title,
  value,
  onChange,
  invalid = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const selected = universities.find((university) => university.value === value)

  useEffect(() => {
    if (!isOpen) return undefined

    function closeOnOutsidePointer(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) optionRefs.current[0]?.focus()
  }, [isOpen])

  function selectUniversity(university) {
    onChange(university.value)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex =
        (index + direction + universities.length) % universities.length
      optionRefs.current[nextIndex]?.focus()
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectUniversity(universities[index])
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <>
      <h2 className="university-select-label" id={`${kind}-university-label`}>
        {title}
      </h2>
      <div className="university-picker" ref={pickerRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${kind}-university-label ${kind}-university-selected-label`}
          className="university-picker-trigger"
          aria-invalid={invalid}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          type="button"
        >
          {selected && <UniversityImage university={selected} />}
          <span id={`${kind}-university-selected-label`}>
            {selected?.label ?? 'Select a university'}
          </span>
          <span className="university-picker-arrow" aria-hidden="true">
            ▾
          </span>
        </button>
        {isOpen && (
          <div
            aria-labelledby={`${kind}-university-label`}
            className="university-picker-options"
            role="listbox"
          >
            {universities.map((university, index) => (
              <div
                aria-selected={value === university.value}
                className="university-picker-option"
                key={university.value}
                onClick={() => selectUniversity(university)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                role="option"
                tabIndex={0}
              >
                <UniversityImage university={university} />
                <span>{university.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default UniversityDropdown
