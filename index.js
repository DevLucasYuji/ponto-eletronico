require('dotenv').config();

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });


    const apontarHoras = async (page) => {
        
        await page.goto(process.env.ESPELHO_PONTO);

        await page.waitForTimeout(5000);

        await page.evaluate( () => {
            var negativeTime = document.querySelectorAll('.right-elem-negativo');
            if(!negativeTime) return
            
            negativeTime.forEach(item => {
                if(item.textContent.trim() == "-08:00"){
                    var button = item.parentElement.parentElement.parentElement.nextElementSibling.querySelector('span.custombtn');
                
                    button.click();     
                    
                    button.nextElementSibling.querySelector('a').click();
                }
            })
        })
        
        await page.waitForTimeout(3000);

        await page.evaluate(async () => {
            var addBtns = document.querySelectorAll('span.custom-link');    

            if(addBtns){
                await addBtns.forEach(async (addBtn) => {
                
                    // STARTA O PRIMEIRO PONTO
                    addBtn.click();
                
                    for(var i = 1; i <= 2; i++) {
                        var tempo = {
                            1: "09:00",
                            2: "12:00",
                            3: "13:00",
                            4: "18:00"
                        }
                        
                        var input = addBtn.previousElementSibling.previousElementSibling.querySelector('[placeholder="00:00"]');
                        
                        input.value = tempo[i]
    
                        var insertButton = addBtn.parentElement.querySelector('span.clickable i.fa-check-circle').parentElement;
    
                        insertButton.click();
    
                        await page.waitForTimeout(2500);
                        
                        if(i != 2) {
                            addBtn.click();
                        }
                    }
                })
            }
        });
    }

    const logar = async (page) => {
        await page.type('#txtUsuario', process.env.WORK_USERNAME);
        
        await page.type('#txtSenha', process.env.WORK_PASSWORD);

        await page.click('#btnEntrar');

        await page.waitForNavigation();

    }

    const alocarHoras = async (page) => {
        await page.goto(process.env.APONTAMENTOS_HORAS);

        await page.waitForTimeout(3500);

        await page.click('#btnConsultar');
    
        await page.waitForTimeout(3500);

        await page.evaluate(()=> {
            var consultar = document.querySelector('#gridConsultaApontamento tbody tr td a');
            consultar.click();
        });
        
        await page.waitForTimeout(3000);

        await page.evaluate(() => {
            var lista = document.querySelectorAll('.listaApropriacao');
    
            lista.forEach(item => {
                // Fernanda é o nome da minha coordenadora
                if(/Fernanda/.test(item.querySelector('.titulo').textContent)) {
                    var timeValue = document.querySelector('#txtHorasReportar').value;
                    var input = item.querySelector('[name="txtHoraAlterar"]');
                    var addBtn = input.nextElementSibling;

                    input.value = timeValue;
                    addBtn.click();
                }
            })
        })
    }

    // Fluxo 

    const page = await browser.newPage();

    await page.goto(process.env.URL_SITE);

    console.log('LOGANDO...')

    await logar(page);

    console.log("APONTANDO HORAS ELETRONICA...");

    await apontarHoras(page);

    console.log('ALOCAR HORAS...');

    await alocarHoras(page);

})();