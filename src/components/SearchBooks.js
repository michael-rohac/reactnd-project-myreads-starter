/**
 * © 2017 Michal Rohac
 */

import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Book from './Book'
import * as BooksApi from '../BooksAPI'
import PropTypes from 'prop-types'

class BookSearch extends Component {
    // Seems to have no effect due to limitation in BooksApi but it's good practise to parametrize such important parameters.
    static MAX_RESULTS = 20;
    /* Timeout in milliseconds used to postpone actual search. If there's not input change for longer than this timeout, then search
       take effect, otherwise previous search request is cancelled or rather not issued at all.
     */
    static TIMEOUT_LAZY_LOAD = 500;

    // Definition of required properties and its types.
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
        // check used to skip useless API calls
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

        /*
           If previous request to search is still pending, it's canceled here. State will override State#lastTimeout in further call
           where is scheduled new search request.
         */
        if (this.state.lastTimeout) {
            clearTimeout(this.state.lastTimeout);
        }

        this.setState((prevState) => {
            return {
                searchHint: 'Searching...',
                searchText: !searchString ? '' : searchString,
                // till new search request take effect there's no need to clear latest result -> better UX
                // books: prevState.books,
                lastTimeout: setTimeout(() => {
                    BooksApi.search(searchString.trim(), BookSearch.MAX_RESULTS).then(result => {
                        // handle unexpected result and reuse book which are already in shelves
                        const searchResult = (Array.isArray(result) ? result : []).map(book => this.props.booksInShelves[book.id] || {
                            ...book,
                            // standardize shelf for books which are not in shelves yet
                            // API returned something else what causes mismatch with BooksApi#getAll()
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