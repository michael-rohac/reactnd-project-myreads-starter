/**
 * © 2017 Michal Rohac
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

class Book extends Component {
    // Definition of required properties and its types.
    static propTypes = {
        book: PropTypes.object.isRequired,
        onBookShelfChange: PropTypes.func.isRequired
    };
    render() {
        const {book, onBookShelfChange} = this.props;
        return (
            <div className="book">
                <div className="book-top">
                    <div className="book-cover" style={{
                        width: 128,
                        height: 193,
                        backgroundImage: `url(${book.imageLinks && book.imageLinks.thumbnail ? book.imageLinks.thumbnail : ''})`
                    }} title={book.description}></div>
                    <div className="book-shelf-changer">
                        <select value={book.shelf} onChange={(e) => {
                            event.preventDefault();
                            onBookShelfChange(book, e.target.value)
                        }}>
                            <option disabled>Move to...</option>
                            <option value="currentlyReading">Currently Reading</option>
                            <option value="wantToRead">Want to Read</option>
                            <option value="read">Read</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                </div>
                <div className="book-title">{book.title}</div>
                <div className="book-authors">
                    {book.authors && book.authors.map((author, idx) => <div key={idx}>{author}</div>)}
                </div>
            </div>
        )
    }
}

export default Book