import { getConfigDBSingleton } from '../../src/util/createDB';

describe('插入测试', () => {
  const li = {
    id: 2,
  };
  it('空插入', () => {
    const db = getConfigDBSingleton();
    db.insert(null, (error) => {
      expect(error).toBe(error);
    });
  });

  it('字符串插入', () => {
    const db = getConfigDBSingleton();
    db.insert('test', (error) => {
      expect(error).toBe(null);
    });
  });

  it('对象插入', () => {
    const db = getConfigDBSingleton();
    db.insert(li, (error) => {
      expect(error).toBe(null);
    });
  });
});

describe('插入测试', () => {
  it('空查询测试', () => {
    const db = getConfigDBSingleton();
    db.find({ id: 'test' }, (err, docs) => {
      expect(err).toBe(null);
      expect(docs.length).toBe(0);
    });
  });

  it('正确查询测试', () => {
    const db = getConfigDBSingleton();
    db.find({ id: 1 }, (err, docs) => {
      expect(err).toBe(null);
      expect(docs.length).toBe(1);
    });
  });
});
