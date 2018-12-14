import json
import statistics
from statistics import mean
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
from scipy.stats.stats import pearsonr   
import numpy



plotly.tools.set_credentials_file(username='USERNAME', api_key='KEY')

agents_total=[]
time_total=[]
max_txs=[]
avg_time_list={}
all_txs=[]

for log in os.listdir("../Backend/logs/"):
    if log.endswith("json"):
        with open("../Backend/logs/"+log, "r") as read_file:
            what = json.load(read_file)
            txs=[]
            tc=[]
            agents = int(what["inputs"]["agents"])
            ctime = float(what["timeElapsedTotal"]/1000)
            position = bisect.bisect_left(agents_total, agents)
            bisect.insort_left(agents_total, agents)
            time_total.insert(position, ctime)


            many = int(len(what["transactions"]))
            max=0
            

            for x in range(100, many-1):


                all_txs.append(float(what["transactions"][x]["txs"]))
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
            # pio.write_image(fig, "../Backend/graphs/"+log.split('.')[0]+".svg")



# black magic

agents_unique=sorted(set(agents_total))

counter=collections.Counter(agents_total)
drones={}
for r in agents_unique:
    drones[r]={}
    l=[]
    for position, item in enumerate(agents_total):
        if item == r:
            l.append(position)
        sum=0
        for z in l:
         sum=sum+int(time_total[z])
         avg_time_list.update({int(r):sum/counter[r]})
         drones[r][z] = time_total[z]


avgagent=list(avg_time_list.keys())
avgtime=list(avg_time_list.values())
print(mean(all_txs))
# print(numpy.corrcoef(agents_total,time_total))



traces = []

for d in agents_unique:
    traces.append(go.Box(
            x=list(drones[d].values()),
            name=d,
            boxmean=True
        ))


layoutd = go.Layout(
    title='Time to Convergence Box Plot',
    xaxis=dict(
        autorange=True,
        title= 'Time to Convergence (seconds)',
        showgrid=True,
        gridwidth=2,
    ),  yaxis=dict(
        title= 'Number of Agents',
        ticklen= 10,
        gridwidth= 2,
    ),
    showlegend=False
)


figd = go.Figure(data=traces, layout=layoutd)
py.plot(figd,filename='ConvergencePlot')



trace = go.Scatter(
    x = time_total,
    y = agents_total,
    mode = 'markers'
)

data = [trace]

# Plot and embed in ipython notebook!
layout= go.Layout(
    title= 'Time to Convergence',
    xaxis= dict(
        title= 'Time Elapsed (seconds)',
        ticklen= 5,
        zeroline= False,
        gridwidth= 2,
    ),
    yaxis=dict(
        title= 'Number of Agents',
        ticklen= 5,
        gridwidth= 2,
    )
)
fig= go.Figure(data=data, layout=layout)
py.plot(fig, filename='Convergence')


trace2 = go.Scatter(
    y= agents_total,
    x = max_txs,
    mode = 'markers'
)

data2 = [trace2]

# Plot and embed in ipython notebook!
layout2= go.Layout(
    title= 'Max Txs',
    yaxis= dict(
        title= 'Number of Agents',
        ticklen= 5,
        gridwidth= 2,
    ),
    xaxis=dict(
        title= 'Txs',
        ticklen= 5,
        gridwidth= 2,
    )
)
fig2= go.Figure(data=data2, layout=layout2)
py.plot(fig2, filename='MaxTxs')



trace4 = go.Scatter(
    x = avgtime,
    y = avgagent,
    mode = 'lines'
)

data4 = [trace4]

# Plot and embed in ipython notebook!
layout4= go.Layout(
    title= 'Average Time to Convergence',
    xaxis= dict(
        title= ' Average Time Elapsed (seconds)',
        ticklen= 5,
        zeroline= False,
        gridwidth= 2,
        range=[0,250]
    ),
    yaxis=dict(
        title= 'Number of Agents',
        ticklen= 5,
        gridwidth= 2,
    ),
    showlegend=False
)
fig4= go.Figure(data=data4, layout=layout4)
py.plot(fig4, filename='AvgTime')
