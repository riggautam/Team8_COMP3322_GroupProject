import React, { useState } from 'react';

// Sample filler blog posts
const BLOG_POSTS = [
  {
    id: 1,
    title: 'My first week at HKU: what I wish I knew',
    author: 'Mia',
    date: '6 Oct 2026',
    readTime: '4 min read',
    category: 'Academic',
    excerpt: 'Navigating Main Campus, finding the best study spots in Main Library, and getting used to the steep hills and escalators!',
    featured: true,
    tags: ['Orientation', 'Campus Life', 'Tips']
  },
  {
    id: 2,
    title: 'How to get an Octopus card and top it up',
    author: 'Lucas',
    date: '4 Oct 2026',
    readTime: '3 min read',
    category: 'Tips',
    excerpt: 'A complete guide for exchange and international students to apply for Student Octopus and set up automatic top-ups.',
    featured: false,
    tags: ['Transport', 'Essentials']
  },
  {
    id: 3,
    title: 'Cheap eats in Kennedy Town and Sai Ying Pun',
    author: 'Chloe',
    date: '2 Oct 2026',
    readTime: '5 min read',
    category: 'Food',
    excerpt: 'Budget-friendly dim sum, cart noodles, and cafes just a short MTR ride or walk away from Centennial Campus.',
    featured: false,
    tags: ['Food', 'Budget']
  },
  {
    id: 4,
    title: 'Best weekend hikes starting near campus',
    author: 'Alex',
    date: '28 Sep 2026',
    readTime: '6 min read',
    category: 'Lifestyle',
    excerpt: 'From Lugard Road at Victoria Peak to Mount Davis – quick nature escapes when you need a study break.',
    featured: false,
    tags: ['Outdoors', 'Hong Kong']
  },
  {
    id: 5,
    title: 'Surviving midterm season: Quiet library spots',
    author: 'Ethan',
    date: '25 Sep 2026',
    readTime: '4 min read',
    category: 'Academic',
    excerpt: 'Hidden study nooks in Chi Wah Learning Commons, Knowles Building, and Fung Ping Shan Library.',
    featured: false,
    tags: ['Study', 'HKU']
  }
];

const CATEGORIES = ['All', 'Academic', 'Lifestyle', 'Food', 'Tips'];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={styles.pageContainer}>
      {/* Banner Header */}
      <header style={styles.banner}>
        <div>
          <h1 style={styles.bannerTitle}>HKU Student Blog</h1>
          <p style={styles.bannerSubtitle}>
            Thursday, 8 October 2026 · Stories, guides, and campus tips from fellow students
          </p>
        </div>
        <div style={styles.skylineGraphic}>
          <div style={styles.skylineBuilding1} />
          <div style={styles.skylineBuilding2} />
          <div style={styles.skylineBuilding3} />
        </div>
      </header>

      {/* Main Content Layout */}
      <div style={styles.layoutGrid}>
        {/* Main Posts Section */}
        <main style={styles.mainContent}>
          {/* Search and Categories */}
          <div style={styles.card}>
            <div style={styles.filterHeader}>
              <div style={styles.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...styles.pillButton,
                      ...(selectedCategory === cat ? styles.activePill : styles.inactivePill)
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Featured Post Card */}
          {selectedCategory === 'All' && !searchQuery && (
            <div style={{ ...styles.card, ...styles.featuredCard }}>
              <div style={styles.featuredBadge}>⭐ Featured Story</div>
              <h2 style={styles.featuredTitle}>{BLOG_POSTS[0].title}</h2>
              <p style={styles.postMeta}>
                By <strong>{BLOG_POSTS[0].author}</strong> · {BLOG_POSTS[0].date} · {BLOG_POSTS[0].readTime}
              </p>
              <p style={styles.excerpt}>{BLOG_POSTS[0].excerpt}</p>
              <div style={styles.tagContainer}>
                {BLOG_POSTS[0].tags.map(t => (
                  <span key={t} style={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Posts List */}
          <div style={styles.postsList}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article key={post.id} style={styles.card}>
                  <div style={styles.postHeader}>
                    <span style={styles.categoryBadge}>{post.category}</span>
                    <span style={styles.postMetaText}>{post.date} · {post.readTime}</span>
                  </div>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  <p style={styles.excerpt}>{post.excerpt}</p>
                  <div style={styles.postFooter}>
                    <span style={styles.authorText}>Written by <strong>{post.author}</strong></span>
                    <button style={styles.readMoreBtn}>Read post →</button>
                  </div>
                </article>
              ))
            ) : (
              <div style={styles.card}>
                <p style={{ color: '#666', textAlign: 'center' }}>No posts found matching your filter.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Column Sidebar */}
        <aside style={styles.sidebar}>
          {/* Create New Post */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <span style={styles.icon}>✏️</span>
              <h3 style={styles.cardTitle}>Share your story</h3>
            </div>
            <p style={styles.sidebarText}>
              Have tips for incoming students or a story about campus life? Write for the HKU Blog!
            </p>
            <button style={styles.primaryButton}>+ Create New Post</button>
          </div>

          {/* Popular Topics */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <span style={styles.icon}>🏷️</span>
              <h3 style={styles.cardTitle}>Popular Topics</h3>
            </div>
            <ul style={styles.quickLinksList}>
              <li><a href="#orientation" style={styles.link}># Exchange Orientation</a></li>
              <li><a href="#canteen" style={styles.link}># Campus Dining Guides</a></li>
              <li><a href="#course-mapping" style={styles.link}># Course Mapping Tips</a></li>
              <li><a href="#living" style={styles.link}># Living in Hong Kong</a></li>
            </ul>
          </div>

          {/* Guidelines Banner */}
          <div style={{ ...styles.card, backgroundColor: '#f0f7f4', borderColor: '#b2d8ce' }}>
            <div style={styles.cardTitleRow}>
              <span style={styles.icon}>ℹ️</span>
              <h3 style={{ ...styles.cardTitle, color: '#004d3d' }}>Blog Guidelines</h3>
            </div>
            <p style={{ ...styles.sidebarText, fontSize: '0.85rem' }}>
              Keep discussions respectful and relevant to student life at HKU.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  pageContainer: {
    backgroundColor: '#f4f5f3',
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#1a1a1a',
  },
  banner: {
    backgroundColor: '#004d3d',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '2rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  bannerSubtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.9rem',
    opacity: 0.85,
  },
  skylineGraphic: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    opacity: 0.25,
  },
  skylineBuilding1: { width: '18px', height: '35px', backgroundColor: '#fff', borderRadius: '2px 2px 0 0' },
  skylineBuilding2: { width: '26px', height: '55px', backgroundColor: '#fff', borderRadius: '2px 2px 0 0' },
  skylineBuilding3: { width: '20px', height: '40px', backgroundColor: '#fff', borderRadius: '2px 2px 0 0' },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '1.5rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  categoryPills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pillButton: {
    borderRadius: '20px',
    padding: '0.4rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  activePill: {
    backgroundColor: '#004d3d',
    color: '#ffffff',
  },
  inactivePill: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  searchInput: {
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
  },
  featuredCard: {
    borderLeft: '5px solid #004d3d',
    backgroundColor: '#fbfcfb',
  },
  featuredBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#004d3d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  featuredTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.4rem',
    color: '#111827',
  },
  postTitle: {
    margin: '0.5rem 0',
    fontSize: '1.2rem',
    color: '#111827',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#004d3d',
    backgroundColor: '#e6f0ed',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  postMetaText: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  postMeta: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: '0 0 0.75rem 0',
  },
  excerpt: {
    color: '#4b5563',
    fontSize: '0.925rem',
    lineHeight: '1.5',
    margin: '0.5rem 0 1rem 0',
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '0.75rem',
    marginTop: '0.5rem',
  },
  authorText: {
    fontSize: '0.85rem',
    color: '#374151',
  },
  readMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#004d3d',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  tagContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  tag: {
    fontSize: '0.75rem',
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  icon: {
    fontSize: '1.1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  sidebarText: {
    fontSize: '0.875rem',
    color: '#4b5563',
    lineHeight: '1.4',
    margin: '0 0 1rem 0',
  },
  primaryButton: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#004d3d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  quickLinksList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#004d3d',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
};

export default Blog;