
exports.getAllUsers = async (ctx) => {
  ctx.body = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
};

exports.getUserById = async (ctx) => {
  const id = ctx.params.id;
  ctx.body = { id, name: `User ${id}` };
};

exports.createUser = async (ctx) => {
  const { name } = ctx.request.body;
  ctx.body = { message: 'User created', user: { id: 3, name } };
};
