/**
 * © 2017 Michal Rohac
 */

import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Book from './Book'
import * as BooksApi from '../BooksAPI'

// Array.isArray pollyfill
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

class BookSearch extends Component {
    static MAX_RESULTS = 20;
    static TIMEOUT_LAZY_LOAD = 500;
    state = {
        searchText: '',
        searchHint: 'To search book use filter.',
        books: [],
        lastTimeout: null
    };

    onSearch(searchString) {
        if (!searchString.trim()) {
            if (this.state.lastTimeout) {
                clearTimeout(this.state.lastTimeout);
            }
            this.setState({
                searchHint: '',
                searchText: searchString,
                books: [],
                lastTimeout: null
            });
            return;
        }
        this.setState((prevState) => {
            return {
                searchHint: 'Searching...',
                searchText: !searchString ? '' : searchString,
                books: prevState.books,
                lastTimeout: setTimeout(() => {
                    BooksApi.search(searchString.trim(), BookSearch.MAX_RESULTS).then(result => {
                        this.setState({books: Array.isArray(result) ? result : [], lastTimeout: null, searchHint: ''});
                    })
                }, BookSearch.TIMEOUT_LAZY_LOAD)
            }
        });
    }

    render() {
        return (
            <div className="search-books">
                <div className="search-books-bar">
                    <Link to="/" className="close-search"/>
                    <div className="search-books-input-wrapper">
                        {/*
                         NOTES: The search from BooksAPI is limited to a particular set of search terms.
                         You can find these search terms here:
                         https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

                         However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
                         you don't find a specific author or title. Every search is limited by search terms.
                         */}
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search by title or author"
                            value={this.state.searchText}
                            onChange={event => this.onSearch(event.target.value)}/>
                    </div>
                </div>
                <div className="search-books-results">
                    <div className="search-hint">
                        {this.state.searchHint || `${this.state.books.length ? "" : "No result has been found, change filter and try again."}`}
                    </div>
                    <ol className="books-grid">
                        {this.state.books.map(book => (
                            <li key={book.id}>
                                <Book book={book}/>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        )
    }
}

export default BookSearch