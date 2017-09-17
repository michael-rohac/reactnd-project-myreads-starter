/**
 * © 2017 Michal Rohac
 */

import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Book from './Book'
import * as BooksApi from '../BooksAPI'
import PropTypes from 'prop-types'

class BookSearch extends Component {
    static MAX_RESULTS = 20;
    static TIMEOUT_LAZY_LOAD = 500;
    static propTypes = {
        booksInShelves: PropTypes.object.isRequired,
        onBookShelfChange: PropTypes.func.isRequired
    };
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
        if (this.state.lastTimeout) {
            clearTimeout(this.state.lastTimeout);
        }
        this.setState((prevState) => {
            return {
                searchHint: 'Searching...',
                searchText: !searchString ? '' : searchString,
                books: prevState.books,
                lastTimeout: setTimeout(() => {
                    BooksApi.search(searchString.trim(), BookSearch.MAX_RESULTS).then(result => {
                        const searchResult = (Array.isArray(result) ? result : []).map(book => this.props.booksInShelves[book.id] || {
                            ...book,
                            shelf: "none"
                        });
                        this.setState({books: searchResult, lastTimeout: null, searchHint: ''});
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
                                <Book book={book} onBookShelfChange={this.props.onBookShelfChange}/>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        )
    }
}

export default BookSearch