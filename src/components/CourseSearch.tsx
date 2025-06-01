// Component: components/CourseSearch.tsx
import React, { useState } from 'react';
import { searchCourses } from '../lib/search';
import type { Event } from 'nostr-tools';
import './CourseSearch.css';

export function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const courses = await searchCourses({ query: searchQuery });
      setResults(courses);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="course-search">
      <div className="search-input">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="search-results">
        {results.map(course => {
          const title = course.tags.find(tag => tag[0] === 'title')?.[1];
          const tags = course.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);
          
          return (
            <div key={course.id} className="course-result">
              <h3>{title}</h3>
              <p>{course.content.slice(0, 200)}...</p>
              <div className="course-tags">
                {tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}