import json
import plotly.plotly as py
import plotly.graph_objs as go
import plotly.io as pio
import os
import bisect
from plotly.offline import init_notebook_mode, plot_mpl
import matplotlib.pyplot as plt
import collections
import plotly
from plotly.offline import iplot, init_notebook_mode

plotly.tools.set_credentials_file(username='USERNAME', api_key='KEY')

agents_total=[]
time_total=[]
max_txs=[]
avg_time_list={}
firstdetect=[]


for log in os.listdir("../Backend/logs/9/real/"):
    if log.endswith("json"):
        with open("../Backend/logs/9/real/"+log, "r") as read_file:
            what = json.load(read_file)
            txs=[]
            tc=[]
            agents = int(what["inputs"]["agents"])
            ctime = float(what["timeElapsedTotal"]/1000)
            detection = float(what["firstComplete"]["timeElapsedTotal"]/1000)
            position = bisect.bisect_left(agents_total, agents)
            bisect.insort_left(agents_total, agents)
            time_total.insert(position, ctime)
            firstdetect.insert(position, detection)


            many = int(len(what["transactions"]))
            max=0
            

            for x in range(50, many-1):


                tc.append(float(what["transactions"][x]["totalTransactionCounter"]))
                txs.append(float(what["transactions"][x]["txs"]))
                if max < float(what["transactions"][x]["txs"]):
                    max = float(what["transactions"][x]["txs"])
                
            
            max_txs.insert(position, max)



            # fig = go.Figure()
            # fig.add_scatter(x=tc,
            #                 y=txs,
            #                 mode='markers',
            #                 line = dict(
            #                 color = ('rgb(22, 96, 167)'),
            #                 width = 1)
            #                     )
            # pio.write_image(fig, "../Backend/graphs/9/real/"+log.split('.')[0]+".svg")




#sim

agents_totals=[]
time_totals=[]
max_txss=[]
avg_time_lists={}
det_time_list={}
firstdetects=[]


for log in os.listdir("../Backend/logs/9/sim/"):
    if log.endswith("json"):
        with open("../Backend/logs/9/sim/"+log, "r") as read_file:
            what = json.load(read_file)
            txs=[]
            tc=[]
            agents = int(what["inputs"]["agents"])
            ctime = float(what["timeElapsedTotal"]/1000)
            detection = float(what["firstComplete"]["timeElapsedTotal"]/1000)
            position = bisect.bisect_left(agents_totals, agents)
            bisect.insort_left(agents_totals, agents)
            time_totals.insert(position, ctime)
            firstdetects.insert(position, detection)


            many = int(len(what["transactions"]))
            max=0
            

            for x in range(50, many-1):


                tc.append(float(what["transactions"][x]["totalTransactionCounter"]))
                txs.append(float(what["transactions"][x]["txs"]))
                if max < float(what["transactions"][x]["txs"]):
                    max = float(what["transactions"][x]["txs"])
                
            
            max_txss.insert(position, max)



            # fig = go.Figure()
            # fig.add_scatter(x=tc,
            #                 y=txs,
            #                 mode='markers',
            #                 line = dict(
            #                 color = ('rgb(22, 96, 167)'),
            #                 width = 1)
            #                     )
            # pio.write_image(fig, "../Backend/graphs/9/sim/"+log.split('.')[0]+".svg")


traces = go.Box(
    y = time_totals,
    name = '9 Sim Agents',
    jitter = 0.3,
    pointpos = -1.8,
    boxpoints = 'all',
    marker=dict(
        color='rgb(10, 140, 208)',
    ),
    boxmean=True,
    showlegend=False
)

tracer = go.Box(
    y = time_total,
    name = '9 Real Agents',
    jitter = 0.3,
    pointpos = -1.8,
    boxpoints = 'all',
    marker=dict(
    color='rgb(8, 81, 156)',
    ),
    boxmean=True,
    showlegend=False
)

data = [traces, tracer]

# Plot and embed in ipython notebook!
layout= go.Layout(
    title= 'Time to Convergence 9 Sim vs Real (seconds)'
)
fig= go.Figure(data=data, layout=layout)
py.plot(fig, filename='Convergence9')

print("Sim mean= ", sum(time_totals) / float(len(time_totals)))
print("Real mean= ", sum(time_total) / float(len(time_total)))


traces2 = go.Box(
    y = firstdetects,
    name = '9 Sim Agents',
    jitter = 0.3,
    pointpos = -1.8,
    boxpoints = 'all',
    marker=dict(
        color='rgb(10, 140, 208)',
    ),
    boxmean=True,
    showlegend=False
)

tracer2 = go.Box(
    y = firstdetect,
    name = '9 Real Agents',
    jitter = 0.3,
    pointpos = -1.8,
    boxpoints = 'all',
    marker=dict(
    color='rgb(8, 81, 156)',
    ),
    boxmean=True,
    showlegend=False
)

data2 = [traces2, tracer2]

# Plot and embed in ipython notebook!
layout2= go.Layout(
    title= 'Time to Detection 9 Sim vs Real (seconds)'
)
fig2= go.Figure(data=data2, layout=layout2)
py.plot(fig2, filename='Detection9')

print("Sim mean= ", sum(time_totals) / float(len(time_totals)))
print("Real mean= ", sum(time_total) / float(len(time_total)))
