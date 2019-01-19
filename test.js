/**
 * Pruebas del paquete jf.Node.
 */
const assert = require('assert');
const jfNode = require('.');
const LENGTH = 5;
const values = [0, 1, '', 'abc', {}, { a : 1 }, [], [0, 1]];

function buildData(length = LENGTH)
{
    return Array.from({ length }).map(() => Math.random());
}

function buildNodes(data)
{
    return data.map(value => new jfNode(value));
}

function testConstructor()
{
    const _sut = new jfNode(0, 1, 2);
    assert.deepStrictEqual(_sut.data, 0);
    assert.deepStrictEqual(_sut.previous, 1);
    assert.deepStrictEqual(_sut.next, 2);
}

function testAfter()
{
    const _data = buildData();
    // Comprobamos aquellos que no tienen next.
    let _nodes  = buildNodes(_data);
    let _output = [];
    _nodes.forEach((node, index) => index && node.after(_nodes[index - 1]));
    // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
    _nodes.forEach((node, index) => node.after(values[index]));
    _nodes[0].concat(_output);
    assert.deepStrictEqual(_data, _output);
    // Comprobamos aquellos que no tienen previous, sin eliminar el nodo.
    _nodes  = buildNodes(_data);
    _output = [];
    for (let _index = LENGTH - 1; _index; --_index)
    {
        _nodes[_index].after(_nodes[_index - 1], false);
    }
    _nodes[0].concat(_output);
    assert.deepStrictEqual(_data, _output);
    // Movemos el nodo teniendo next y previous.
    _nodes  = buildNodes(_data);
    _output = [];
    _nodes.forEach((node, index) => index && node.after(_nodes[index - 1]));
    _nodes[1].after(_nodes[2]);
    _nodes[0].concat(_output);
    assert.deepStrictEqual([_data[0], _data[2], _data[1], ..._data.slice(3)], _output);
}

function testBefore()
{
    const _data = buildData();
    // Comprobamos aquellos que no tienen previous.
    let _nodes  = buildNodes(_data);
    let _output = [];
    for (let _index = LENGTH - 1; _index; --_index)
    {
        _nodes[_index - 1].before(_nodes[_index]);
    }
    // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
    _nodes.forEach((node, index) => node.before(values[index]));
    _nodes[0].concat(_output);
    assert.deepStrictEqual(_data, _output);
    // Comprobamos aquellos que no tienen next, sin eliminar el nodo.
    _nodes  = buildNodes(_data);
    _output = [];
    _nodes.forEach((node, index) => index < LENGTH - 1 && node.before(_nodes[index + 1], false));
    _nodes[0].concat(_output);
    assert.deepStrictEqual(_data, _output);
    // Movemos el nodo teniendo next y previous.
    _nodes  = buildNodes(_data);
    _output = [];
    for (let _index = LENGTH - 1; _index; --_index)
    {
        _nodes[_index - 1].before(_nodes[_index]);
    }
    _nodes[2].before(_nodes[1]);
    _nodes[0].concat(_output);
    assert.deepStrictEqual([_data[0], _data[2], _data[1], ..._data.slice(3)], _output);
}

function testClone()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data);
    assert.deepStrictEqual(_nodes, _nodes.map(n => n.clone()));
}

function testRemove()
{
    const _data  = buildData(5);
    const _nodes = buildNodes(_data);
    _nodes.forEach((node, index) => index && node.after(_nodes[index - 1]));
    // Eliminamos el último que no tiene next
    // Eliminamos el tercero que tiene previous y next.
    // Eliminamos el primero que no tiene previous
    [_data.length - 1, 2, 0].forEach(
        index =>
        {
            _nodes[index].remove();
            _nodes.splice(index, 1);
            _data.splice(index, 1);
            const _output = [];
            _nodes[0].concat(_output);
            assert.deepStrictEqual(_data, _output);
        }
    );
}

function testToJson()
{
    values.forEach(
        value => assert.deepStrictEqual(new jfNode(value).toJSON(), value)
    );
}

testConstructor();
testAfter();
testBefore();
testClone();
testRemove();
testToJson();
