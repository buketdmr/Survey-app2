'use strict';

const Operators = {
    Equals: '=',
    LessThan: '<',
    LessThanOrEqualTo: '<=',
    GreaterThan: '>',
    GreaterThanOrEqualTo: '>=',
    DoesNotEqual: '<>',
    Between: 'BETWEEN',
    PercentDifference: '% DIFFERENCE',
};

const ComparisonOperators = {
    run(data, comparison) {
        try {
            if (data.length === 0) {
                return false;
            }
            if (comparison.RETURNVALUECOMPARISONTYPE === Operators.Equals) {
                return this.equals(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.LessThan) {
                return this.lessThan(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.LessThanOrEqualTo) {
                return this.lessThanOrEqualTo(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.GreaterThan) {
                return this.greaterThan(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.GreaterThanOrEqualTo) {
                return this.greaterThanOrEqualTo(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.DoesNotEqual) {
                return this.doesNotEqual(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.Between) {
                return this.between(data, comparison);
            } else if (comparison.RETURNVALUECOMPARISONTYPE === Operators.PercentDifference) {
                return this.percentDifference(data, comparison);
            }
        } catch (ex) {
            return false;
        }
    },

    equals(data, comparison) {
        return data === comparison.EXPECTEDVALUE1;
    },

    lessThan(data, comparison) {
        return data < comparison.EXPECTEDVALUE1;
    },

    lessThanOrEqualTo(data, comparison) {
        return data <= comparison.EXPECTEDVALUE1;
    },

    greaterThan(data, comparison) {
        return data > comparison.EXPECTEDVALUE1;
    },

    greaterThanOrEqualTo(data, comparison) {
        return data >= comparison.EXPECTEDVALUE1;
    },

    doesNotEqual(data, comparison) {
        return data !== comparison.EXPECTEDVALUE1;
    },

    between(data, comparison) {
        return data > comparison.EXPECTEDVALUE1 && data > comparison.EXPECTEDVALUE2;
    },

    percentDifference(data, comparison) {
        return data === comparison.EXPECTEDVALUE1;
    },
};

module.exports = ComparisonOperators;
