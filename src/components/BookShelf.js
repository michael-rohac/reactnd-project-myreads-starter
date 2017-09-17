/**
 * © 2017 Michal Rohac
 */

import React, {Component} from 'react'
import Book from './Book'
import PropTypes from 'prop-types'

class BookShelf extends Component {
    // Definition of required properties and its types.
    static propTypes = {
        title: PropTypes.string.isRequired,
        books: PropTypes.array.isRequired,
        onBookShelfChange: PropTypes.func.isRequired
    };

    render() {
        const {title, books, onBookShelfChange} = this.props;
        return (
            <div className="bookshelf">
                <h2 className="bookshelf-title">{title}</h2>
                <div className="bookshelf-books">
                    <ol className="books-grid">
                        {books.map(book => (
                            <li key={book.id}>
                                <Book book={book} onBookShelfChange={onBookShelfChange}/>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        )
    }
}

export default BookShelf