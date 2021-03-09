var controller = {

  initTable : function(){$('#inventory').DataTable({order:[[0,"asc"]],"pagingType": "simple_numbers"})},

  formatMessage : function(message_type){
    /* Message type 1 = form submission error.  Message type 2 = success message. Message type 3 = saving message.*/
    let message_container = $('#message_container');
        message_container.removeClass() // clear all existing class assignments
    if( message_type == 1 ){
     message_container.addClass('badge badge-danger p-3');
     message_container.html('The system is unable to process your form. Please review your entries. Invalid entries are highlighted in red.');}
    else if( message_type == 2 ){
      message_container.addClass('badge badge-success p-3');
      message_container.html('<i class="fas fa-check"></i> Changes were saved');
    }
    else if( message_type == 3 ){
      message_container.addClass('badge badge-warning p-3');
      message_container.html('<i class="fas fa-spinner fa-spin"></i> Saving ...');
    }
  },
  
  delBook : function(book_id){
    if(confirm('Permanently delete this book?\nClick OK to delete, Cancel to reconsider')){location="/deleteBook/" + book_id + ""}
  },

  addPurchaseRecordRow : function(table_id,book_id){
    $('#no_matching_rows').remove();
    let new_row = '<tr><td><input type="date" name="date_ordered" id="date_ordered"class="form-control form-control-sm "></td>' +
    '<td><input type="date" name="date_received" id="date_received" class="form-control form-control-sm" format="MM/DD/YYYY"></td>' +
    '<td><input type="number" class="form-control form-control-sm text-right" name="number_purchased" id="number_purchased"></td>' + 
    '<td><input type="number" step=".01" class="form-control form-control-sm" name="purchase_cost" id="purchase_cost"></td>' +
    '<td><input type="text" class="form-control form-control-sm" placeholder="Company Name" name="supplier" id="supplier"></td>' +
    '<td class="text-center"><a href="javascript:void(0)" title="Save this purchase" onclick="controller.savePurchase()"><i class="fad fa-save mt-2 mr-2"></i></a> <a href="" title="Cancel"><i class="fad fa-times-circle"></i></a></td></tr>'
    let tbl = $('#purchase_table > tbody');
        tbl.append(new_row);
    $('#purchase_record_footer').show();
    $('#date_ordered').focus();
    $('.btn-add').attr('disabled','disabled');
  },

  editPurchase : function(purchase_id){
    let row_id = '#' + 'purchase_id_' + purchase_id + '';
    let row = $(row_id);
    $('#purchase_id_'+purchase_id+' td').each(function(x){
      let txt = $(this).text();
      $(this).html('<input type="text" value="' + txt + '"class="form-control form-control-sm">');
    })

  },

  savePurchase : function(){
    /* Validation */
    let fields_to_check = ['date_ordered','number_purchased','purchase_cost','supplier'];
    let fields_to_flag = [];
    let valid = true;

    for(field in fields_to_check){
      let el = $('#'+fields_to_check[field]);
      let val = el.val();
      if (val == '' || val == undefined) { 
        el.addClass('border-danger');
        fields_to_flag.push(el);
        valid = false;
        el.blur(function(){
          if(el.val() != '' && el.val() != undefined){
            el.removeClass('border-danger')}
          else{el.addClass('border-danger')}})} 
      else{
        el.removeClass('border-danger');}
    }

    if(valid == false){
      controller.formatMessage(1);
      fields_to_flag[0].focus();
    }

    if( valid == true){
    let formData = {
      'book_id':$('#id').val(),
      'date_ordered':$('#date_ordered').val(),
      'date_received':$('#date_received').val(),
      'number_purchased':$('#number_purchased').val(),
      'cost':$('#purchase_cost').val(),
      'supplier':$('#supplier').val()
    }
    $.post({
      url: "/savePurchase",
      data: formData,
      success: function(){controller.formatMessage(3);setTimeout(() => { location.reload(); }, 2000);}
    });
  }
  },

  updatePurchase : function(purchase_id){ 
    let row_id = '#' + 'purchase_id_' + purchase_id + '';
    let row = $(row_id);
    let obj = '';
    let date_ordered = ''; 
    let date_received = '';
    let number_purchased = 0;
    let cost = 0.0;
    let supplier = '';

    $('#purchase_id_'+purchase_id+' td input').each(function(x){
      let name = $(this).attr('name');
      let val = $(this).val();
      if(name == 'date_ordered'){date_ordered = val;}
      if(name == 'date_received'){date_received = val;}
      if(name == 'number_purchased'){number_purchased = val;}
      if(name == 'cost'){cost = val};
      if(name == 'supplier'){supplier = val};
    });
    let formData = {'purchase_id': purchase_id,'date_ordered':date_ordered,'date_received':date_received,'number_purchased':number_purchased,'cost':cost,'supplier':supplier};
    console.log(formData)
    $.post({url:'/updatePurchase',data:formData,success:function(r){controller.formatMessage(2);setTimeout(() => { location.reload(); }, 2000);}});

  },


  deletePurchase : function(purchase_id){
    if(confirm('Permanently delete this purchase record?\nThis action cannot be undone.\nSelect OK to delete, Cancel to reconsider')){
      let formData = {'id':purchase_id}
    }
      $.post({
        url: "/deletePurchase",
        data: {'purchase_id':purchase_id},
        success: function(){location.reload()}
      });

  }


}