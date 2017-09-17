import React from 'react'
import {Route, Link} from 'react-router-dom'
import * as BooksApi from './BooksAPI'
import SearchBooks from './components/SearchBooks'
import BookShelf from './components/BookShelf'

import './App.css'

class BooksApp extends React.Component {
    state = {
        initialized: false,
        currentlyReading: [],
        wantToRead: [],
        read: []
    };

    onBookShelfChange(book, newShelf) {
        if (!book || !newShelf || book.shelf === newShelf) return;
        BooksApi.update(book, newShelf).then(result => {
            const filter = {
                currentlyReading: result.currentlyReading || [],
                wantToRead: result.wantToRead || [],
                read: result.read || []
            };
            this.setState(prevState => {
                const newState = {};
                const newBook = {...book, shelf: newShelf};
                for (const shelf of Object.keys(prevState)) {
                    if (shelf === book.shelf) {
                        newState[shelf] = prevState[shelf].filter(oldBook => book.id !== oldBook.id)
                    } else if (shelf === newShelf) {
                        newState[shelf] = prevState[shelf].concat([newBook]);
                    } else {
                        newState[shelf] = prevState[shelf];
                    }
                }

                return {
                    currentlyReading: newState.currentlyReading.filter(book => filter.currentlyReading.includes(book.id)),
                    wantToRead: newState.wantToRead.filter(book => filter.wantToRead.includes(book.id)),
                    read: newState.read.filter(book => filter.read.includes(book.id))
                }
            })
        });
    };

    componentDidMount() {
        if (this.state.initialized) return;
        BooksApi.getAll().then(result => {
            const books = {
                initialized: true,
                currentlyReading: [],
                wantToRead: [],
                read: []
            };
            for (const book of result) {
                books[book.shelf].push(book);
            }
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
                        booksInShelves={ [].concat(this.state.currentlyReading, this.state.wantToRead, this.state.read).reduce((acc, book) => {acc[book.id] = book; return acc;}, {})}
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
