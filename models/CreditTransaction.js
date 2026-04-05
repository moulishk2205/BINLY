// Dummy placeholder model (prevents require errors)

const CreditTransaction = {
  create: async (data) => {
    return { id: 1, ...data };
  },

  findByUser: async (userId) => {
    return [];
  }
};

module.exports = CreditTransaction;

