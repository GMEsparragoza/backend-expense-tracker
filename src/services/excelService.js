const ExcelJS = require('exceljs');
const { getIncomesByDate } = require('../models/Income');
const { getExpensesByDate } = require('../models/Expense');

const generateFinancialReport = async (req, res) => {
    const user = req.user;
    try {
        const ObjectIncomes = await getIncomesByDate(user);
        const ObjectExpenses = await getExpensesByDate(user);

        const incomes = ObjectIncomes.rows;
        const expenses = ObjectExpenses.rows;

        // Crear workbook y worksheet
        const workbook = new ExcelJS.Workbook();

        // Agrupar datos por mes
        const monthsMap = {};

        // Agrupar ingresos por mes
        incomes.forEach(income => {
            const date = new Date(income.date);
            const monthKey = `${date.toLocaleString('default', { month: 'long' }).toUpperCase()} ${date.getFullYear()}`;

            if (!monthsMap[monthKey]) {
                monthsMap[monthKey] = { incomes: [], expenses: [] };
            }
            monthsMap[monthKey].incomes.push(income);
        });

        // Agrupar egresos por mes
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.toLocaleString('default', { month: 'long' }).toUpperCase()} ${date.getFullYear()}`;

            if (!monthsMap[monthKey]) {
                monthsMap[monthKey] = { incomes: [], expenses: [] };
            }
            monthsMap[monthKey].expenses.push(expense);
        });

        // Actualizar los estilos para asegurar texto blanco en fondos oscuros
        const styles = {
            headerBlue: {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0B4E87' } // Azul oscuro
                },
                font: {
                    color: { argb: 'FFFFFF' },
                    bold: true
                }
            },
            lightBlue: {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '4B97E5' } // Azul claro
                },
                font: {
                    color: { argb: '000000' }
                }
            },
            headerOrange: {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'C65911' } // Naranja oscuro
                },
                font: {
                    color: { argb: 'FFFFFF' },
                    bold: true
                }
            },
            lightOrange: {
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F4B084' } // Naranja claro
                },
                font: {
                    color: { argb: '000000' }
                }
            }
        };

        // Función helper para aplicar estilos
        const applyStyle = (cell, style) => {
            cell.fill = style.fill;
            cell.font = style.font;
        };

        // Procesar cada mes
        Object.keys(monthsMap).forEach(month => {
            const sheet = workbook.addWorksheet(month, {
                properties: { tabColor: { argb: '4B97E5' } }
            });

            // Configurar columnas
            sheet.columns = [
                { header: '', width: 35 }, // Columna A
                { header: '', width: 15 }, // Columna B
                { header: '', width: 15 }  // Columna C
            ];

            // Título del reporte
            sheet.mergeCells('A1:B1');
            const titleRow = sheet.getRow(1);
            titleRow.getCell(1).value = 'BALANCE MENSUAL';
            titleRow.getCell(1).font = { bold: true, size: 14 };

            let currentRow = 3;

            // Sección de Ingresos
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const incomesHeader = sheet.getRow(currentRow);
            incomesHeader.getCell(1).value = 'INGRESOS';
            applyStyle(incomesHeader.getCell(1), styles.headerBlue);
            applyStyle(incomesHeader.getCell(2), styles.headerBlue);
            currentRow++;

            // Columnas de Ingresos
            const incomesHeaderRow = sheet.getRow(currentRow);
            incomesHeaderRow.getCell(1).value = 'TIPO DE INGRESO';
            incomesHeaderRow.getCell(2).value = 'MONTO';
            applyStyle(incomesHeaderRow.getCell(1), styles.headerBlue);
            applyStyle(incomesHeaderRow.getCell(2), styles.headerBlue);
            currentRow++;

            const incomesbyCategory = monthsMap[month].incomes.reduce((acc, income) => {
                if (!acc[income.category]) {
                    acc[income.category] = 0;
                }
                acc[income.category] += income.amount;
                return acc;
            }, {});

            // Calcular el total de ingresos
            const totalIncome = Object.values(incomesbyCategory).reduce((acc, amount) => acc + amount, 0);

            // Ingresos
            Object.entries(incomesbyCategory).forEach(([category, amount]) => {
                const row = sheet.getRow(currentRow);
                row.getCell(1).value = category;
                row.getCell(2).value = amount;
                applyStyle(row.getCell(1), styles.lightBlue);
                applyStyle(row.getCell(2), styles.lightBlue);
                row.getCell(2).numFmt = '#,##0';
                currentRow++;
            });

            // Total de ingresos
            const totalIncomeRow = sheet.getRow(currentRow);
            totalIncomeRow.getCell(1).value = 'TOTAL INGRESOS';
            totalIncomeRow.getCell(2).value = totalIncome;
            applyStyle(totalIncomeRow.getCell(1), styles.headerBlue);
            applyStyle(totalIncomeRow.getCell(2), styles.headerBlue);
            totalIncomeRow.getCell(2).numFmt = '#,##0';
            currentRow += 2;

            // Sección de Egresos
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const expensesHeader = sheet.getRow(currentRow);
            expensesHeader.getCell(1).value = 'EGRESOS';
            applyStyle(expensesHeader.getCell(1), styles.headerOrange);
            applyStyle(expensesHeader.getCell(2), styles.headerOrange);
            currentRow++;

            // Calcular egresos por categoría
            const expensesByCategory = monthsMap[month].expenses.reduce((acc, expense) => {
                if (!acc[expense.category]) {
                    acc[expense.category] = { total: 0, items: [] };
                }
                acc[expense.category].total += expense.amount;
                acc[expense.category].items.push(expense);
                return acc;
            }, {});

            // Calcular el total de egresos
            const totalExpenses = Object.values(expensesByCategory).reduce((acc, data) => acc + data.total, 0);

            // Egresos por categoría
            Object.entries(expensesByCategory).forEach(([category, data]) => {
                // Categoría y total
                const categoryRow = sheet.getRow(currentRow);
                categoryRow.getCell(1).value = category;
                categoryRow.getCell(2).value = data.total;
                applyStyle(categoryRow.getCell(1), styles.headerOrange);
                applyStyle(categoryRow.getCell(2), styles.headerOrange);
                categoryRow.getCell(2).numFmt = '#,##0';
                currentRow++;

                // Items de la categoría
                data.items.forEach(expense => {
                    const row = sheet.getRow(currentRow);
                    row.getCell(1).value = expense.description;
                    row.getCell(2).value = expense.amount;
                    applyStyle(row.getCell(1), styles.lightOrange);
                    applyStyle(row.getCell(2), styles.lightOrange);
                    row.getCell(2).numFmt = '#,##0';
                    currentRow++;
                });
            });

            // Total de egresos
            const totalExpensesRow = sheet.getRow(currentRow);
            totalExpensesRow.getCell(1).value = 'TOTAL EGRESOS';
            totalExpensesRow.getCell(2).value = totalExpenses;
            applyStyle(totalExpensesRow.getCell(1), styles.headerOrange);
            applyStyle(totalExpensesRow.getCell(2), styles.headerOrange);
            totalExpensesRow.getCell(2).numFmt = '#,##0';
            currentRow += 2;

            // Sección de Patrimonio
            const patrimonyRow = sheet.getRow(currentRow);
            patrimonyRow.getCell(1).value = 'TOTAL PATRIMONIO';
            patrimonyRow.getCell(2).value = totalIncome - totalExpenses;
            patrimonyRow.getCell(2).numFmt = '#,##0';
            patrimonyRow.font = { bold: true };

            // Bordes para todas las celdas usadas
            const borderStyle = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Obtener la última fila y columna utilizadas
            const lastRow = currentRow;
            const lastCol = 2; // Sabemos que usamos hasta la columna B

            // Aplicar bordes a todas las celdas utilizadas
            for (let row = 1; row <= lastRow; row++) {
                for (let col = 1; col <= lastCol; col++) {
                    const cell = sheet.getCell(row, col);
                    cell.border = borderStyle;
                }
            }

            // Ajustar ancho de columnas
            sheet.getColumn(1).width = 40;
            sheet.getColumn(2).width = 15;
        });

        // Generar archivo
        const buffer = await workbook.xlsx.writeBuffer();

        // Enviar respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Balance Mensual.xlsx"');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error al generar el reporte');
    }
};

module.exports = { generateFinancialReport };