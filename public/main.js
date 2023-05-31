var boy= document.getElementById('boy');
var blur= document.getElementById('blurme');
var count=0;

getData(function(records)
{
    records.forEach(function(record){

        var div=document.createElement('div');
        var img= document.createElement('img');
        img.setAttribute('height', '100%');
        img.setAttribute('width', '100%');
        img.src= record.img;
        var h5= document.createElement('h5');
        h5.innerText= record.name;
        
        var btn= document.createElement('button');
        var cartBtn= document.createElement('button');
        var discriptionDivision= document.createElement('div');
        var actionButtonDiv = document.createElement('div');
        btn.innerText= 'details';
        cartBtn.innerHTML= "Book ✈️"
        cartBtn.setAttribute('id', record.id);
        cartBtn.classList.add("addCart");
        
        btn.className= 'viewDetail';
        discriptionDivision.appendChild(h5);
        div.appendChild(img);
        div.appendChild(discriptionDivision);
        actionButtonDiv.appendChild(btn);
        actionButtonDiv.appendChild(cartBtn);
        div.appendChild(actionButtonDiv);
        actionButtonDiv.classList.add("actionButtonDiv");

        var disc= document.createElement('div');

        disc.classList.add('modals');
        disc.classList.toggle('toggle');
        
        var discHead= document.createElement('p');
        discHead.className= 'discHead';
        discHead.innerText= record.disc;
        var discHeading= document.createElement('h5');
        discHeading.innerText= record.name;
        var cancelDisc= document.createElement('button');
        cancelDisc.innerText= 'close';
        cancelDisc.className= 'close';
        disc.appendChild(discHeading);
        disc.appendChild(discHead);
        disc.appendChild(cancelDisc);
        discriptionDivision.appendChild(disc);

        boy.appendChild(div);

    });
    
});

function getData(callback)
{ 
    count=count+5;
    
    var request= new XMLHttpRequest();
    request.open('get', '/getdata'+"?co="+count, true);

    request.send();

    request.addEventListener('load', function()
    {

        callback(JSON.parse(request.responseText));
    });
}


// actions 

document.addEventListener('click', (e)=>
{

    if(e.target.className== 'viewDetail')
    {
        // console.log(e.target.parentElement.previousElementSibling.children[1].classList);
        e.target.parentElement.previousElementSibling.children[1].classList.toggle('toggle');
        // (e.target.children[0]).classList.toggle('detailsCOntent');
        // var disablebtn= document.querySelectorAll('.viewDetail');
        // disablebtn.disabled= true;
        // for
        blur.classList.toggle('toggle');
        
    }
    if(e.target.className== 'close')
    {
        e.target.parentElement.classList.toggle('toggle');  
        blur.classList.toggle('toggle');
    }
    if(e.target.className== 'addCart')
    {
        
        var id= e.target.id;
        book(id, function(item)
        {
            
            console.log("success");
        });
    }

});

// getting item on book starts

function book(id, callback)
{ 
    var request= new XMLHttpRequest();
    request.open('get', '/book'+"?ide="+id);

    request.send();
    request.addEventListener('load', function()
    {

        callback();
    });
}

// getting item on book ends





// show more
// count=0;
var ShowMore= document.getElementById('ShowMore');
ShowMore.addEventListener('click', function()
{
    getData(function(records)
{
    if(records.length> 0)
    {
    records.forEach(function(record){

        var div=document.createElement('div');
        var img= document.createElement('img');
        img.src= record.img;
        img.setAttribute('height', '100%');
        img.setAttribute('width', '100%');
        var h5= document.createElement('h5');
        h5.innerText= record.name;
        
        var btn= document.createElement('button');
        var cartBtn= document.createElement('button');
        var discriptionDivision= document.createElement('div');
        var actionButtonDiv = document.createElement('div');
        btn.innerText= 'details';
        cartBtn.innerHTML= "Book ✈️"
        cartBtn.setAttribute('id', record.id);
        cartBtn.classList.add("addCart");
        btn.className= 'viewDetail';
        discriptionDivision.appendChild(h5);
        div.appendChild(img);
        div.appendChild(discriptionDivision);
        actionButtonDiv.appendChild(btn);
        actionButtonDiv.appendChild(cartBtn);
        div.appendChild(actionButtonDiv);
        actionButtonDiv.classList.add("actionButtonDiv");
        // actionButtonDiv.style.position= 'relative';
        // actionButtonDiv.style.display= "flex";
        // actionButtonDiv.style.justifyContent= "center";
        // actionButtonDiv.style.alignItems= "center";
        // actionButtonDiv.style.flexWrap= "wrap";
        // actionButtonDiv.style.top= '-30%';
        // actionButtonDiv.style.right= '0';
        // actionButtonDiv.style.left= '0';
        // btn.style.border= 'none';
        // btn.style.transform= 'translate -50% -50%';

        var disc= document.createElement('div');

        disc.classList.add('modals');
        disc.classList.toggle('toggle');
        
        var discHead= document.createElement('p');
        discHead.className= 'discHead';
        discHead.innerText= record.disc;
        var discHeading= document.createElement('h5');
        discHeading.innerText= record.name;
        var cancelDisc= document.createElement('button');
        cancelDisc.innerText= 'close';
        cancelDisc.className= 'close';
        disc.appendChild(discHeading);
        disc.appendChild(discHead);
        disc.appendChild(cancelDisc);
        discriptionDivision.appendChild(disc);

        boy.appendChild(div);

    });
}
else{
    ShowMore.innerText= "Empty";
}
});
});


