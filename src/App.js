import React from 'react'
import {Route, Link} from 'react-router-dom'
import * as BooksApi from './BooksAPI'
import SearchBooks from './components/SearchBooks'
import BookShelf from './components/BookShelf'

import './App.css'

class BooksApp extends React.Component {
    state = {
        currentlyReading: [],
        wantToRead: [],
        read: []
    };

    componentDidMount() {
        BooksApi.getAll().then(result => {
            const books = {
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
                                <BookShelf books={this.state.currentlyReading} title="Currently Reading" />
                                <BookShelf books={this.state.wantToRead} title="Want to Read"/>
                                <BookShelf books={this.state.read} title="Read"/>
                            </div>
                        </div>
                        <div className="open-search">
                            <Link to="/search">Add a book</Link>
                        </div>
                    </div>
                )}/>
                <Route path="/search" component={SearchBooks}/>
            </div>
        )
    }
}

export default BooksApp
