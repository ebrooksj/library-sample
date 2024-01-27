# Overview
Our goal is to provide a simple api to perform basic functions that would be required by a library. 

# Requirements
For our library to function, we'll require the following features:
- A basic framework for authorization. Explicity, we will not handle the case of authentication. There will be two categories of users: librarians and users. Librarians will have the ability to add, remove, and update books. Users will have the ability to check out books and return books.
- An adminstrative API that allows:
    - Adding/removing a book
    - Generating a report of overdue books
- A user-facing API that allows:
    - Checking out a book 
        - Only if it is available AND the user does not currently have three simultaneous books checked out
        - Users are also prevented from checking out a book if they have an overdue booke
    - Returning a book
    - Provide a list of all currently checked out books for the user (should this include due date?)
-A
# Data Model
Based on our requirements, we require only two basic data models: a user and a book. Books are unique by their ISBN. Users are unique by their id.
## User
A user requires permissions: librarian/user. Since we won't have a system of centralized management for these claims, we'll simply use a roles table, associated with their user id. User id will be provided by the API sender, using a simple request header `x-auth-user-id`. 
We  should also name our user, and give them some other unique identifier. For this exercise, we'll use a `mobileNumber` field as the unique identifier.
For the purposes of this exercise, we'll preseed our database with 4 users: 1 librarian (user id 1), and 3 standard users (ids 2-4).
This gives us the following basic schema:
```json
Users collection
{
    "id": 1,
    "name": {
        "first":"Gandalf",
        "last": "Grey"
    },
    "mobileNumber": "555-555-5555",
    "createdDate": "2024-01-23T00:00:00.000Z",
}
```

```json
Roles collection
{
    "userId": 1,
    "role": "librarian"
}
```

## Book
A book is uniquely identified by its ISBN. We'll also need to track the current status of the book (checked out or not), and the user who has it checked out (if applicable). We'll also need to track the checkout date, and the due date.  We'll obviously want the title/author of the book as well, so users can see at a glance which books they have checked out.
```json
Books collection
{
    "isbn": "978-3-16-148410-0",
    "title": "The Lord of the Rings",
    "author": "J.R.R. Tolkien",
    "status": "CHECKED_OUT",
}
```

```json
Checkouts collection
{
    "userId": 1,
    "isbn": "978-3-16-148410-0",
    "checkoutDate": "2024-01-23T00:00:00.000Z",
    "dueDate": "2024-02-23T00:00:00.000Z",
}
```