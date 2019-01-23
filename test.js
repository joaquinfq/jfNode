/**
 * Pruebas del paquete jf.Node.
 */
const assert = require('assert');
const jfNode = require('.');
const LENGTH = 5;
const PROPS = [ 'data', 'previous', 'next', 'value' ];
const values = [0, 1, '', 'abc', {}, { a : 1 }, [], [0, 1]];
let count = 0;

function buildData(length = LENGTH)
{
    return Array.from({ length }).map(() => Math.random());
}

function buildNodes(data, method = '')
{
    const _nodes = data.map(value => new jfNode({ data : value }));
    if (method === 'after')
    {
        _nodes.forEach((node, index) => index && node.after(_nodes[index - 1]));
    }
    else if (method === 'before')
    {
        for (let _index = LENGTH - 1; _index; --_index)
        {
            _nodes[_index - 1].before(_nodes[_index]);
        }
    }

    return _nodes;
}

function test(actual, expected)
{
    assert.deepStrictEqual(actual, expected);
    ++count;
}
function testConstructor()
{
    const _config = {};
    PROPS.forEach(name => _config[name] = Math.random());
    const _sut = new jfNode(_config);
    PROPS.forEach(name => test(_sut[name], _config[name]));
}

function testAfter()
{
    const _data = buildData();
    // Comprobamos aquellos que no tienen next.
    let _nodes  = buildNodes(_data, 'after');
    let _output = [];
    // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
    _nodes.forEach((node, index) => node.after(values[index]));
    _nodes[0].pluck(_output);
    test(_data, _output);
    // Comprobamos aquellos que no tienen previous, sin eliminar el nodo.
    _nodes  = buildNodes(_data);
    _output = [];
    for (let _index = LENGTH - 1; _index; --_index)
    {
        _nodes[_index].after(_nodes[_index - 1], false);
    }
    _nodes[0].pluck(_output);
    test(_data, _output);
    // Movemos el nodo teniendo next y previous.
    _nodes  = buildNodes(_data, 'after');
    _output = [];
    _nodes[1].after(_nodes[2]);
    _nodes[0].pluck(_output);
    test([_data[0], _data[2], _data[1], ..._data.slice(3)], _output);
}

function testBefore()
{
    const _data = buildData();
    // Comprobamos aquellos que no tienen previous.
    let _nodes  = buildNodes(_data, 'before');
    let _output = [];
    // Valores que no son nodos para verificar que no afecten el resultado ni falle el método.
    _nodes.forEach((node, index) => node.before(values[index]));
    _nodes[0].pluck(_output);
    test(_data, _output);
    // Comprobamos aquellos que no tienen next, sin eliminar el nodo.
    _nodes  = buildNodes(_data);
    _output = [];
    _nodes.forEach((node, index) => index < LENGTH - 1 && node.before(_nodes[index + 1], false));
    _nodes[0].pluck(_output);
    test(_data, _output);
    // Movemos el nodo teniendo next y previous.
    _nodes  = buildNodes(_data, 'before');
    _output = [];
    _nodes[2].before(_nodes[1]);
    _nodes[0].pluck(_output);
    test([_data[0], _data[2], _data[1], ..._data.slice(3)], _output);
}

function testClone()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data);
    test(_nodes, _nodes.map(n => n.clone()));
}

function testDump()
{
    const _config = {};
    PROPS.forEach(name => _config[name] = Math.random());
    const _node = new jfNode(_config);
    const _log  = console.log;
    let _called = 0;
    console.log = text =>
    {
        test(text, JSON.stringify(_node, null, 4));
        _called = 1;
    };
    _node.dump();
    console.log = _log;
    test(_called, 1);
}

function testFind()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data, 'after');
    _nodes.forEach((node, index) => node.value = LENGTH - index);
    // Iteración hacia adelante sobre las propiedades data (por defecto) y value
    _data.forEach(
        (value, index) =>
        {
            test(_nodes[index], _nodes[0].find(value, 'next'));
            test(_nodes[index], _nodes[0].find(LENGTH - index, 'next', 'value'));
        }
    );
    // Iteración hacia atrás sobre las propiedades data (por defecto) y value
    _data.forEach(
        (value, index) =>
        {
            test(_nodes[index], _nodes[LENGTH - 1].find(value, 'previous'));
            test(_nodes[index], _nodes[LENGTH - 1].find(LENGTH - index, 'previous', 'value'));
        }
    );
}

function testLookup()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data, 'after');
    // Buscamos el primer nodo de la secuencia.
    _nodes.forEach(node => test(node.lookup(), _nodes[0]));
    // Buscamos el último nodo de la secuencia.
    _nodes.forEach(node => test(node.lookup('next'), _nodes[LENGTH - 1]));
}

function testRemove()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data, 'after');
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
            _nodes[0].pluck(_output);
            test(_data, _output);
        }
    );
}

function testSetProperties()
{
    const _node = new jfNode();
    //------------------------------------------------------------------------------
    // No debería fallar si no se pasa ningún parámetro o diversos tipos de datos.
    //------------------------------------------------------------------------------
    _node.setProperties();
    values.forEach(value => _node.setProperties(value));
    //------------------------------------------------------------------------------
    // Las propiedades que no existen en la instancia no deberían asignarse.
    //------------------------------------------------------------------------------
    const _props = Array.from({ length : 10 }).map((value, index) => String.fromCharCode(index));
    let _values = {};
    _props.forEach((name, index) => _values[name] = index);
    _node.setProperties(_values);
    _props.forEach(name => test(_node[name], undefined));
    //------------------------------------------------------------------------------
    // Asignación de propiedades válidas.
    //------------------------------------------------------------------------------
    let _value = Math.random();
    _node.setProperties({ data : _value });
    test(_node.data, _value);
    _value = Math.random();
    _node.setProperties({ value : _value });
    test(_node.value, _value);
    //------------------------------------------------------------------------------
    // Omisión de valores undefined
    //------------------------------------------------------------------------------
    _node.setProperties({ value : undefined });
    test(_node.value, _value);
}

function testSiblings()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data, 'after');
    const _middle = Math.floor(LENGTH / 2);
    const _value = Math.random();
    _nodes[_middle - 1].value = _nodes[_middle + 1].value = _value;
    // Si existe el valor.
    test(_nodes[_middle].siblings(_value, 'previous', 'value'), [ _nodes[_middle - 1] ]);
    test(_nodes[_middle].siblings(_value, 'next', 'value'), [ _nodes[_middle + 1] ]);
    // Si no existe el valor.
    test(_nodes[_middle - 1].siblings(Math.random(), 'previous', 'value'), []);
    test(_nodes[_middle + 1].siblings(Math.random(), 'next', 'value'), []);
}

function testToArray()
{
    const _data  = buildData();
    const _nodes = buildNodes(_data, 'after');
    // Da igual el nodo donde se empiece, se tiene que devolver toda la secuencia ordenada.
    _nodes.forEach(
        node => test(node.toArray().map(node => node.data), _data)
    );
}

function testToJson()
{
    // Agregamos propiedades privadas y protegidas para verificar que no se serialicen.
    class jfNodeTest extends jfNode
    {
        constructor(config)
        {
            super(config);
            this._protected = 'protected';
            this.__private  = 'private';
        }
    }
    const _config = {};
    PROPS.sort().forEach(name => _config[name] = Math.random());
    const _sut = new jfNodeTest(_config);
    delete _config.previous;
    delete _config.next;
    test(_sut.toJSON(), _config);
}

testConstructor();
testAfter();
testBefore();
testClone();
testDump();
testFind();
testLookup();
testRemove();
testSetProperties();
testSiblings();
testToArray();
testToJson();
console.log('Total aserciones: %d', count);
