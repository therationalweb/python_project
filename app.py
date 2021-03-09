# Title : app.py
# Author: Thomas Bishop
# Purpose: Demonstrates CRUD functions using Python and MongoDb
# To Do: 
#   1) Investigate benefits of creating Data Access Object and Error Handling modules.
#   2) Refactor controller js to use arrow functions

import os # not used here, but would be helpful to access environment variables.
import sys
from flask import Flask, render_template, request, url_for, redirect
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import datetime
import logging

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/Books"
mongo = PyMongo(app)

@app.route('/')
def index():
  book_inventory=mongo.db.inventory.find()
  return render_template('/index.html',book_inventory=book_inventory)

@app.route('/addBook', methods = (['GET','POST']))
def addBook():
  if request.method == 'POST':
    try:
      # Do insert method here
      title = request.form['title']
      author = request.form['author']
      isbn = request.form['isbn']
      qty = int(request.form['qty'])
      price = float(request.form['price'])
      result = mongo.db.inventory.insert_one({'title':title,'author':author,'isbn':isbn,'qty':qty,'price':price})
      # Send user to edit page so they can add purchases.
      return redirect(url_for('editBook',id=str(result.inserted_id)))
    except:
      logging.warning(sys.exc_info()[0])
  return render_template('/addBook.html')      

@app.route('/editBook/<id>', methods = ('GET','POST'))
def editBook(id):
  # Get data when opening the form
  if request.method == 'GET':
      book = mongo.db.inventory.find_one_or_404({"_id":ObjectId(id)})
      orders = mongo.db.purchases.find({"book_id":ObjectId(id)}).sort('date_ordered',1)
      return render_template('/editBook.html',book=book, orders=orders) 
  # do form post and save data when submitting the form
  if request.method == 'POST':
    try:
      book_id = ObjectId(request.form['id'])
      title = request.form['title']
      author = request.form['author']
      isbn = request.form['isbn']
      qty = int(request.form['qty'])
      price = float(request.form['price'])    
      result = mongo.db.inventory.update({'_id':book_id},{'$set': {'title':title,'author':author,'isbn':isbn,'qty':qty,'price':price}}, upsert=False)
      return redirect(url_for('index'))
    except:
      logging.warning(sys.exc_info()[0])

@app.route('/deleteBook/<id>', methods = ['GET'])
def deleteBook(id):
   # Delete an existing book

   book_id = ObjectId(id)
   result = mongo.db.inventory.remove({'_id':book_id})
   return redirect(url_for('index'))

@app.route('/savePurchase', methods=['POST'])
def savePurchase():
   try:
     book_id = ObjectId(request.form['book_id'])
     date_ordered = datetime.datetime.strptime(request.form['date_ordered'],'%Y-%m-%d')
     date_received = datetime.datetime.strptime(request.form['date_received'],'%Y-%m-%d')
     number_purchased = int(request.form['number_purchased'])
     cost = float(request.form['cost'])
     supplier = request.form['supplier']
     result = mongo.db.purchases.insert_one({'book_id':book_id,'date_ordered':date_ordered,'date_received':date_received,'number_purchased':number_purchased,'cost':cost,'supplier':supplier})
     return redirect(url_for('index'))
   except:
     logging.warning(sys.exc_info()[0])

@app.route('/deletePurchase',methods=['POST'])   
def deletePurchase():
  try:
    purchase_id = ObjectId(request.form['purchase_id'])
    result = mongo.db.purchases.remove({'_id':purchase_id});
    return redirect(url_for('index'))
  except:
    logging.warning(sys.exc_info()[0])

@app.route('/updatePurchase', methods=['POST'])
def updatePurchase():
  try:
    purchase_id = ObjectId(request.form['purchase_id'])
    date_ordered = datetime.datetime.strptime(request.form['date_ordered'],'%Y-%m-%d')
    date_received = datetime.datetime.strptime(request.form['date_received'],'%Y-%m-%d')
    number_purchased = int(request.form['number_purchased'])
    cost = float(request.form['cost'])
    supplier = request.form['supplier']
    result = mongo.db.purchases.update({'_id':purchase_id},{'$set': {'date_ordered':date_ordered,'date_received':date_received,'number_purchased':number_purchased,'cost':cost,'supplier':supplier}},upsert=False)
    return redirect(url_for('index'))  
  except:
    logging.warning(sys.exc_info()[0])  