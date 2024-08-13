const spil = {
    "karte" : [
    ]
}

function stvoriSpil() {
    let vrijednost = ["2","3","4","5","6","7","8","9","10","decko","dama","kralj","as"]
    let boja = ["herc","karo","pik","tref"]
    for (let index = 0; index < vrijednost.length; index++) {
        const vrijednost1 = vrijednost[index];
        for (let index2 = 0; index2 < boja.length; index2++) {
            const boja1 = boja[index2];
            spil.karte.push({"name" : vrijednost1 + "_" + boja1})
        }
    }   
}

stvoriSpil()

const shiftCard = (name) => {
    const button = document.getElementById(name)
    const holder = document.querySelector(".holder");
    const stol = document.createElement("div");
    //stol.textContent = name;
    stol.classList.add("stol");
    holder.replaceChildren(stol)
    button.remove();
    const slika = document.createElement('img');
    slika.src = "./karte_slike/" + name + ".png";
    slika.alt = name;
    slika.classList.add('slika-karte');
    stol.appendChild(slika);
}

const createCard = (name) => {
    const button = document.createElement('button');
    button.classList.add('karta');
    //button.textContent = name;
    button.id = name;
    button.addEventListener('click', () => {
        shiftCard(name)
    });
    const slika = document.createElement('img');
    slika.src = "./karte_slike/" + name + ".png";
    slika.alt = name;
    slika.classList.add('slika-karte');
    button.appendChild(slika);
    return button;
}

const addCards = () => {
    for (let index = 0; index < 10; index++) {
        let nasumicniBroj = Math.floor(Math.random() * 100 % 52);
        const gumb = createCard(spil.karte[nasumicniBroj].name);
        const ruka = document.querySelector(".ruka");
        ruka.appendChild(gumb);
    }
}

addCards()