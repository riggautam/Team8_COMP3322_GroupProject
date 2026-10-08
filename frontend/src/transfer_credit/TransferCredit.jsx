import { useEffect, useRef, useState } from 'react'
import hkuIcon from '../assets/HKU.png'
import queensIcon from '../assets/Queens.png'
import sfuIcon from '../assets/SFU.png'
import unswIcon from '../assets/UNSW.png'
import uqIcon from '../assets/UQ.png'
import westernIcon from '../assets/Western.png'
import Button from '../global/Button.jsx'
import LoadingSpinner from '../global/LoadingSpinner.jsx'
import './TransferCredit.css'

const universities = [
  {
    value: 'queens',
    label: "Queen's University",
    icon: queensIcon,
  },
  {
    value: 'sfu',
    label: 'Simon Fraser University (SFU)',
    icon: sfuIcon,
  },
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

function UniversityImage({ university, className = '' }) {
  if (!university?.icon) return null

  return (
    <span className={`university-image ${className}`}>
      <img src={university.icon} alt="" />
    </span>
  )
}

function UniversityPicker({ kind, title, selectedUniversity, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const selected = universities.find(
    (university) => university.value === selectedUniversity,
  )

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
    <section className={`university-column university-column--${kind}`}>
      <h2 className="university-select-label" id={`${kind}-university-label`}>
        {title}
      </h2>
      <div className="university-picker" ref={pickerRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${kind}-university-label ${kind}-university-selected-label`}
          className="university-picker-trigger"
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          type="button"
        >
          <UniversityImage university={selected} />
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
                aria-selected={selectedUniversity === university.value}
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
      <div className="university-placeholder">
        {selected ? (
          <UniversityImage
            className="university-image--preview"
            university={selected}
          />
        ) : (
          <p>University logo placeholder</p>
        )}
        {selected && <p>{selected.label}</p>}
      </div>
    </section>
  )
}

function TransferCredit() {
  const [exchangeUniversity, setExchangeUniversity] = useState('')
  const [homeUniversity, setHomeUniversity] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  return (
    <section
      className="university-comparison"
      aria-label="Select exchange and home universities"
    >
      <UniversityPicker
        kind="exchange"
        title="Exchange university"
        selectedUniversity={exchangeUniversity}
        onChange={setExchangeUniversity}
      />
      <div className="comparison-middle">
        <svg
          aria-label="Credits transfer from exchange university to home university"
          className="comparison-arrow"
          viewBox="0 0 48 24"
          role="img"
        >
          <path d="M2 12h41m-9-9 9 9-9 9" />
        </svg>
        <div className="comparison-action">
          {isSearching ? (
            <LoadingSpinner label="Searching home university courses" />
          ) : (
            <Button onClick={() => setIsSearching(true)}>Transfer</Button>
          )}
        </div>
      </div>
      <UniversityPicker
        kind="home"
        title="Home university"
        selectedUniversity={homeUniversity}
        onChange={setHomeUniversity}
      />
    </section>
  )
}

export default TransferCredit
