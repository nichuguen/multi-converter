#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, render_template, redirect, url_for, jsonify, request
from converter import app

input_formats = [
	"UFT-8",
	"UFT-16",
	"base64",
	"urlencode",
	"python",
]

def encode_with_format(fid, input):
	return str(get_fname(fid)) + ": " + str(input)

def get_fname(id):
	return input_formats[int(id)-1]

def get_id(fname):
	id = 0
	for f in input_formats:
		if f == fname:
			return id
		id += 1

@app.route("/")
def route_home():
    return render_template("index.html")

@app.route("/api/types")
def get_types():
	fid = 1
	ftypes = []
	for format_name in input_formats:
		ftypes.append({
			"id" : fid,
			"name" : format_name
		})
		fid += 1
	return jsonify(ftypes)

@app.route("/api/encode")
def encode():
	input_format_id = request.args.get('format', 0)
	if input_format_id == 0:
		return jsonify({ "error": "No input provided" }), 412
	input_content = request.args.get('content', '')
	fname = get_fname(input_format_id)

	results = []
	for format_name in input_formats:
		results.append({
			"id" : get_id(format_name),
			"name" : format_name,
			"content" : encode_with_format(get_id(format_name), input_content)
		})
	return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
