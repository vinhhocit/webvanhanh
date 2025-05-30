// DOM Elements
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
const navMenu = document.querySelector(".nav-menu")
const backToTopBtn = document.getElementById("backToTop")
const faqItems = document.querySelectorAll(".faq-item")
const searchInput = document.getElementById("searchInput")
const clearSearch = document.getElementById("clearSearch")
const searchResults = document.getElementById("searchResults")
const mainContent = document.querySelector(".main-content")
let searchHighlights = []

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeFAQ()
  initializeSearch()
  initializeScrollAnimations()
  initializeNavigation()
  initializeBackToTop()
  initializeMobileMenu()
})

// Mobile Menu Toggle
function initializeMobileMenu() {
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active")
      this.classList.toggle("active")
    })
  }
}

// FAQ Functionality
function initializeFAQ() {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active")

        // Close all FAQ items
        faqItems.forEach((faq) => faq.classList.remove("active"))

        // Open clicked item if it wasn't active
        if (!isActive) {
          item.classList.add("active")
        }
      })
    }
  })
}

// Search Functionality
function initializeSearch() {
  if (!searchInput) return

  const searchIndex = createSearchIndex()

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim()
    performSearch(query, searchIndex)

    if (query) {
      clearSearch.style.display = "block"
    } else {
      clearSearch.style.display = "none"
    }
  })

  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      searchInput.value = ""
      clearSearchResults()
      clearSearch.style.display = "none"
      searchInput.focus()
    })
  }

  // Hide results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container") && !e.target.closest(".search-results")) {
      searchResults.style.display = "none"
    }
  })

  // Show results when focusing on search input
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() && searchResults.innerHTML) {
      searchResults.style.display = "block"
    }
  })

  // Keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearSearchResults()
      searchInput.blur()
    }
  })
}

// Create search index
function createSearchIndex() {
  const searchableElements = document.querySelectorAll("h2, h3, h4, h5, p, li")
  const searchIndex = []

  searchableElements.forEach((element, index) => {
    const text = element.textContent.trim()
    const section = element.closest(".section, .subsection")
    const sectionId = section ? section.id : ""
    const sectionTitle = section ? section.querySelector("h2, h3")?.textContent : ""

    if (text && text.length > 3) {
      searchIndex.push({
        id: index,
        text: text,
        element: element,
        sectionId: sectionId,
        sectionTitle: sectionTitle,
        type: element.tagName.toLowerCase(),
      })
    }
  })

  return searchIndex
}

// Perform search
function performSearch(query, searchIndex) {
  if (!query || query.length < 2) {
    clearSearchResults()
    return
  }

  const results = searchIndex.filter((item) => item.text.toLowerCase().includes(query.toLowerCase()))

  displaySearchResults(results, query)
  highlightSearchTerms(query)
}

// Display search results
function displaySearchResults(results, query) {
  if (!searchResults) return

  searchResults.innerHTML = ""

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="no-results">Không tìm thấy kết quả nào</div>'
    searchResults.style.display = "block"
    return
  }

  const resultsList = document.createElement("div")
  resultsList.className = "results-list"

  // Group results by section
  const groupedResults = {}
  results.forEach((result) => {
    const sectionTitle = result.sectionTitle || "Khác"
    if (!groupedResults[sectionTitle]) {
      groupedResults[sectionTitle] = []
    }
    groupedResults[sectionTitle].push(result)
  })

  Object.keys(groupedResults).forEach((sectionTitle) => {
    const sectionGroup = document.createElement("div")
    sectionGroup.className = "result-group"

    const sectionHeader = document.createElement("div")
    sectionHeader.className = "result-group-header"
    sectionHeader.textContent = sectionTitle
    sectionGroup.appendChild(sectionHeader)

    groupedResults[sectionTitle].slice(0, 3).forEach((result) => {
      const resultItem = document.createElement("div")
      resultItem.className = "result-item"

      const highlightedText = highlightQueryInText(result.text, query)
      resultItem.innerHTML = `
        <div class="result-text">${highlightedText}</div>
        <div class="result-type">${getTypeLabel(result.type)}</div>
      `

      resultItem.addEventListener("click", () => {
        scrollToElement(result.element)
        searchInput.blur()
      })

      sectionGroup.appendChild(resultItem)
    })

    resultsList.appendChild(sectionGroup)
  })

  searchResults.appendChild(resultsList)
  searchResults.style.display = "block"
}

// Highlight query in text
function highlightQueryInText(text, query) {
  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

// Get type label
function getTypeLabel(type) {
  const labels = {
    h2: "Chương",
    h3: "Mục",
    h4: "Bước",
    h5: "Tiểu mục",
    p: "Đoạn văn",
    li: "Danh sách",
  }
  return labels[type] || "Nội dung"
}

// Scroll to element
function scrollToElement(element) {
  const headerHeight = document.querySelector(".header").offsetHeight
  const targetPosition = element.offsetTop - headerHeight - 20

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  })

  // Highlight element temporarily
  element.classList.add("search-target-highlight")
  setTimeout(() => {
    element.classList.remove("search-target-highlight")
  }, 2000)
}

// Highlight search terms in content
function highlightSearchTerms(query) {
  clearHighlights()

  if (!query || query.length < 2) return

  const walker = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, null, false)

  const textNodes = []
  let node
  while ((node = walker.nextNode())) {
    if (node.textContent.toLowerCase().includes(query.toLowerCase())) {
      textNodes.push(node)
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode
    if (parent.tagName === "MARK") return // Avoid nested highlights

    const text = textNode.textContent
    const regex = new RegExp(`(${query})`, "gi")

    if (regex.test(text)) {
      const highlightedHTML = text.replace(regex, '<mark class="content-highlight">$1</mark>')
      const wrapper = document.createElement("span")
      wrapper.innerHTML = highlightedHTML

      parent.replaceChild(wrapper, textNode)
      searchHighlights.push(wrapper)
    }
  })
}

// Clear highlights
function clearHighlights() {
  searchHighlights.forEach((wrapper) => {
    const parent = wrapper.parentNode
    const textContent = wrapper.textContent
    const textNode = document.createTextNode(textContent)
    parent.replaceChild(textNode, wrapper)
  })
  searchHighlights = []
}

// Clear search results
function clearSearchResults() {
  if (searchResults) {
    searchResults.style.display = "none"
    searchResults.innerHTML = ""
  }
  clearHighlights()
}

// Scroll Animations
function initializeScrollAnimations() {
  const animateElements = document.querySelectorAll(".step, .note-box, .contact-card, .channel")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-on-scroll", "animated")
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  animateElements.forEach((el) => {
    el.classList.add("animate-on-scroll")
    observer.observe(el)
  })
}

// Navigation
function initializeNavigation() {
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const headerHeight = document.querySelector(".header").offsetHeight
        const targetPosition = target.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // Active navigation highlighting
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]")
    const navLinks = document.querySelectorAll(".nav-list a")

    let current = ""
    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.clientHeight
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active")
      }
    })
  })
}

// Back to Top Button
function initializeBackToTop() {
  if (!backToTopBtn) return

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible")
    } else {
      backToTopBtn.classList.remove("visible")
    }
  })

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header")
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)"
    header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)"
    header.style.boxShadow = "none"
  }
})

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close mobile menu if open
    if (navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
      mobileMenuToggle.classList.remove("active")
    }
    // Close search results
    clearSearchResults()
  }
})

// Performance optimization - Lazy loading images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// Preloader (if needed)
window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader")
  if (preloader) {
    preloader.style.opacity = "0"
    setTimeout(() => {
      preloader.style.display = "none"
    }, 300)
  }
})
