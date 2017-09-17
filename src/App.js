import React from 'react'
import {Route, Link} from 'react-router-dom'
import * as BooksApi from './BooksAPI'
import SearchBooks from './components/SearchBooks'
import BookShelf from './components/BookShelf'

import './App.css'

class BooksApp extends React.Component {
    state = {
        // distinguish between very first load and later interactions to prevent useless API calls
        initialized: false,
        // shelves definition
        currentlyReading: [],
        wantToRead: [],
        read: []
    };

    onBookShelfChange(book, newShelf) {
        // perform basic checks as a good practise when component is available for use in other projects +  prevent useless API calls
        if (!book || !newShelf || book.shelf === newShelf) return;

        // API call to update book
        BooksApi.update(book, newShelf).then(result => {
            // can't be sure that result always contains given arrays
            // I skipped here check for weird results what causes to filter out everyhting if unexpected result comes
            const filter = {
                currentlyReading: result.currentlyReading || [],
                wantToRead: result.wantToRead || [],
                read: result.read || []
            };

            this.setState(prevState => {
                const newState = {};
                // new book belongs to other shelf but rest of fields are the same
                const newBook = {...book, shelf: newShelf};

                // in practise I would check if Object.keys is always available and setup polyfill if it's needed what I skipped here
                for (const shelf of Object.keys(prevState)) {
                    if (shelf === book.shelf) {
                        // need to filter out book which doesn't belong to old shelf any more
                        newState[shelf] = prevState[shelf].filter(oldBook => book.id !== oldBook.id)
                    } else if (shelf === newShelf) {
                        // take all old books + new one
                        newState[shelf] = prevState[shelf].concat([newBook]);
                    } else {
                        // leave everything else as it is
                        newState[shelf] = prevState[shelf];
                    }
                }

                // response seems to indicate in result which book IDs belongs to which shelf
                // use the filter to stay in sync with latest known server state
                return {
                    currentlyReading: newState.currentlyReading.filter(book => filter.currentlyReading.includes(book.id)),
                    wantToRead: newState.wantToRead.filter(book => filter.wantToRead.includes(book.id)),
                    read: newState.read.filter(book => filter.read.includes(book.id))
                }
            })
        });
    };

    componentDidMount() {
        // issue API call only for very first application visit
        if (this.state.initialized) return;
        BooksApi.getAll().then(result => {
            const books = {
                initialized: true,
                currentlyReading: [],
                wantToRead: [],
                read: []
            };
            // categorize books
            for (const book of result) {
                books[book.shelf].push(book);
            }
            // change state to re-render UI
            this.setState(books);
        })
    };

    render() {
        return (
            <div className="app">
                <Route exact path="/" render={() => (
                    <div className="list-books">
                        <div className="list-books-title">
                            <h1>MyReads</h1>
                        </div>
                        <div className="list-books-content">
                            <div>
                                <BookShelf books={this.state.currentlyReading} title="Currently Reading"
                                           onBookShelfChange={this.onBookShelfChange.bind(this)}/>
                                <BookShelf books={this.state.wantToRead} title="Want to Read"
                                           onBookShelfChange={this.onBookShelfChange.bind(this)}/>
                                <BookShelf books={this.state.read} title="Read"
                                           onBookShelfChange={this.onBookShelfChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="open-search">
                            <Link to="/search">Add a book</Link>
                        </div>
                    </div>
                )}/>
                <Route path="/search" render={({history}) => (
                    <SearchBooks
                        /* Create object mapping book IDs to books for sync purpose with SearchBooks view. */
                        booksInShelves={ [].concat(this.state.currentlyReading, this.state.wantToRead, this.state.read).reduce((acc, book) => {acc[book.id] = book; return acc;}, {})}
                        /* Handle shelf change and change URL back to app root. */
                        onBookShelfChange={(book, shelf) => {
                            this.onBookShelfChange(book, shelf);
                            history.push("/");
                        }}/>
                )}/>
            </div>
        )
    }
}

export default BooksApp
