export const booksData = new Map([
  ['history-of-computer-industry', [
    {
      type: 'chapter', name: 'http-methods', contents:
        '[...] To interact with a system using the HTTP protocol, one needs to think of the system as a collection of resources.\n' +
        'A resource is an entity that can be identified by a URI (Uniform Resource Identifier), also known as a \'path\' inside the system.\n' +
        'The HTTP protocol defines a set of methods that can be used to interact with resources. These methods are:\n' +
        '- GET: Retrieve the contents of a resource\n' +
        '- POST: Create a new resource\n' +
        '- PUT: Update (replace or upsert) a resource\n' +
        '- DELETE: Delete a resource\n' +
        '- OPTIONS: Retrieve the list of methods supported by a resource\n' +
        'Accessing the resources of a system in this way comprises the \'REST\' methodology, which stands for \'REpresentational State Transfer\'.\n' +
        'This methodology defines a set of constraints that must be met by a system in order to be considered RESTful.\n' +
        'The constraints are:\n' +
        '- Client-Server: The system must be a client-server system, where the client is the user and the server is the system.\n' +
        '- Stateless: The system must be stateless, meaning that it does not maintain any information about the state of the system between requests.\n' +
        '- Uniform Interface: The system must have a uniform interface, meaning that it should have the same methods and parameters for all resources.\n' +
        '[...]\n' +
        'This is in contrast to the older \'SOAP\' methodology, which is more focused on the communication between a client and a server.\n' +
        '[...]\n' +
        '(Some hand-written notes lie at the bottom of the page:\n' +
        '"- POST can be called multiple times and a new resource will be created for each call"\n' +
        '"- e.g. POST /potatoes with body { "content": "starch" } will create potatoes 1,2,3,4,5..."\n' +
        '"- PUT will update the same resource every time, it is \'idempotent\'"\n' +
        '"- e.g. PUT /potatoes/1 with body { "content": "starch" } will always update the first potato"\n'
    },
    {
      type: 'chapter', name: 'http-headers', contents:
        '[...] The HTTP protocol defines a set of headers that can be used to provide additional information about a request or a response.\n' +
        'These headers are:\n' +
        '- Content-Type: The type of the content being sent.\n' +
        '- Last-Modified: The last modified date of the resource being created or updated.\n' +
        '- Accept: The content types that the client can accept.\n' +
        '- Accept-Encoding: The content encodings that the client can accept.\n' +
        '- Authorization: The authorization credentials of the client.\n' +
        '- True-Client-IP: The true IP address of the client.\n' +
        '- Cookie: The cookies of the client.\n' +
        '- Set-Cookie: The cookies that the server wants to set.\n' +
        '[...]\n'
    },
    {
      type: 'chapter', name: 'appendix', contents:
        '[...]\n' +
        'Library of Computer Science\n' +
        'School of Electrical and Computer Engineering\n' +
        'Technical University of Continued Education\n' +
        'cslib.ece.tuce.edu\n' +
        '[...]\n'
    },
  ]]
]);
